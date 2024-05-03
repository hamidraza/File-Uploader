import React, { useState, useEffect, useCallback } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from "firebase/storage";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import { HiOutlineTrash } from "react-icons/hi2";
import { FaFile } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import {
  doc,
  setDoc,
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { HiDocument, HiDownload, HiSave } from "react-icons/hi";
import { CiEdit } from "react-icons/ci";

function Dashboard() {
  // const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const db = getFirestore();
  const auth = getAuth();
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchFiles(currentUser);
      } else {
        setUser(null);
        setSelectedFiles([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);
  const fetchFiles = async (currentUser) => {
    const filesCollectionRef = collection(
      db,
      "users",
      currentUser.uid,
      "files"
    );
    try {
      const querySnapshot = await getDocs(filesCollectionRef);
      let fetchedFiles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort files by the 'uploadedAt' timestamp, most recent first
      fetchedFiles.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
      setFiles(fetchedFiles);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };
  // const onFileChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   console.log(
  //     "Selected file:",
  //     selectedFile ? selectedFile.name : "No file selected"
  //   );
  //   setFile(selectedFile);
  // };

  const uploadFile = async (file) => {
    if (file && user) {
      setLoading(true);
      const storageRef = getStorage();
      const fileRef = ref(storageRef, `files/${user.uid}/${file.name}`);
      try {
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        const fileMetadata = {
          name: file.name,
          url: url,
          path: fileRef.fullPath,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        const fileDocRef = doc(db, "users", user.uid, "files", file.name);
        await setDoc(fileDocRef, fileMetadata);
        fetchFiles(user);
        // setFile(null);
        setSelectedFiles([]);
      } catch (error) {
        console.error("Failed to upload file:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onUpload = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setLoading(true);
    try {
      await Promise.all(selectedFiles.map(uploadFile));
      setSelectedFiles([]); // Clear selected files after uploading
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleEditClick = (index, fileName) => {
    setEditing(index);
    setNewName(fileName);
  };
  const saveNewName = async (index) => {
    const file = files[index];
    if (newName.trim() === "") {
      alert("File name cannot be empty.");
      return;
    }
    setLoading(true);
    const fileDocRef = doc(db, "users", user.uid, "files", file.id);
    await setDoc(fileDocRef, { name: newName }, { merge: true });
    fetchFiles(user);
    setEditing(null);
    setNewName("");
    setLoading(false);
  };
  const deleteFile = async (index) => {
    const file = files[index];
    console.log("File data:", file);
    if (!file || (!file.path && !file.url)) {
      console.error("Invalid file data:", file);
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (confirmDelete) {
      setLoading(true);
      try {
        let fileRef;
        if (file.path) {
          fileRef = ref(getStorage(), file.path);
        } else {
          const matchedPath = file.url.match(/(files%2F.+\?alt=media)/);
          if (matchedPath) {
            fileRef = ref(getStorage(), decodeURIComponent(matchedPath[1]));
          }
        }
        await deleteObject(fileRef);
        const fileDocRef = doc(db, "users", user.uid, "files", file.id);
        await deleteDoc(fileDocRef);
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        console.log("File and metadata deleted successfully");
      } catch (error) {
        console.error("Error removing file:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  const downloadFile = (file) => {
    if (!file.url) {
      console.error("File URL is missing");
      return;
    }
    const link = document.createElement("a");
    link.href = file.url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useDropzone({ useFsAccessApi: false });

  useEffect(() => {
    console.log("Selected files:", selectedFiles);
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.map((file) => console.log(file.name));
      setSelectedFiles(acceptedFiles.map((file) => file));
    },
    webkitdirectory: true,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-5">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload New File
        </h2>
        <div
          {...getRootProps()}
          className="flex flex-col justify-center items-center border-dashed border-2 border-gray-300 py-12 px-4 rounded-lg cursor-pointer"
        >
          <input
            {...getInputProps({
              onChange: (event) => {
                if (event.target.files.length > 0) {
                  console.log(
                    "Selected file via input:",
                    event.target.files[0].name
                  );
                  setSelectedFiles(event.target.files);
                }
              },
              webkitdirectory: "true",
            })}
          />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : selectedFiles.length ? (
            <ul>
              {selectedFiles.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center flex-col gap-8">
              <HiOutlineCloudArrowUp className="text-blue-500 text-4xl" />
              <p className="ml-2">
                Drag 'n' drop some files here, or click to select files
              </p>
            </div>
          )}
        </div>
        <button
          onClick={(e) => onUpload(e)}
          disabled={!selectedFiles.length || loading} // Update the condition here
          className={`mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !selectedFiles.length || loading // Update the condition here as well
              ? "bg-indigo-300"
              : "bg-indigo-600 hover:bg-indigo-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          Upload
        </button>
      </div>
      <div className="search-bar mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Search Files
        </h2>
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full text-sm text-gray-700 border border-gray-200 rounded-md p-2"
        />
      </div>
      <div className="files-table">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Uploaded Files
        </h2>
        <div className="max-w-4xl mx-auto shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Preview
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  File Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Download
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Edit
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {file.contentType &&
                    file.contentType.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <FaFile className="w-8 h-8 text-gray-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editing === index ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span>{file.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900 flex justify-center">
                    <button onClick={() => downloadFile(file)}>
                      <HiDownload className="w-7 h-7 text-indigo-400" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    {editing === index ? (
                      <button onClick={() => saveNewName(index)}>
                        <HiSave className="w-7 h-7" />
                      </button>
                    ) : (
                      <button onClick={() => handleEditClick(index, file.name)}>
                        <CiEdit className="w-7 h-7 text-indigo-400" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 hover:text-red-800">
                    <button onClick={() => deleteFile(index)}>
                      <HiOutlineTrash className="w-7 h-7 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
