import axios from "axios";
import pLimit from "p-limit";

const chunkSize = 1024 * 1024 * 2; // 2MB

export const handleFileExport = async () => {
  try {
    alert("Exporting to an excel file");
    const response = await axios.get("/patient/download/", {
      responseType: "blob", // Important: This tells axios to expect a binary response instead of JSON
    });

    // Create a URL for the blob
    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    // Create a temporary anchor element and trigger the download
    const fileLink = document.createElement("a");
    fileLink.href = fileURL;
    fileLink.setAttribute("download", "patients_details.xlsx"); // Set the file name for the download
    document.body.appendChild(fileLink);

    fileLink.click(); // Trigger the download

    // Clean up by removing the temporary link
    fileLink.remove();
  } catch (err) {
    throw new Error("Failed to export data", err);
  }
};

const sendInitialRequest = async (file) => {
  const formData = new FormData();
  formData.append("fileName", file.name);
  formData.append("fileSize", file.size);
  formData.append("totalChunks", Math.ceil(file.size / chunkSize));

  try {
    const response = await axios.post("/patient/upload/initiate/", formData);
    if (response.status === 200) {
      return response.data.uploadID; // Assuming the server responds with a unique upload ID
    }
  } catch (err) {
    console.error("Error initiating chunk upload:", err);
    throw err;
  }
};

// uploadChunk function
const uploadChunk = async (chunk, chunkNumber, uploadID, noOfTries = 0) => {
  const formData = new FormData();
  formData.append("file", chunk);
  formData.append("chunkNumber", chunkNumber);
  formData.append("uploadID", uploadID);

  try {
    const response = await axios.post("/patient/upload/chunk/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (err) {
    if (noOfTries < 3) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, noOfTries))
      );
      return uploadChunk(chunk, chunkNumber, uploadID, noOfTries + 1);
    }
    throw new Error(`Error uploading chunk ${chunkNumber}: ${err.message}`);
  }
};

const confirmUploadCompletion = async (uploadID) => {
  try {
    const params = new URLSearchParams();
    params.append('uploadID', uploadID);

    // Set the Content-Type header and send the URL-encoded data
    const response = await axios.post("/patient/upload/complete/", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (response.status === 200) {
      alert("File uploaded successfully");
    }
  } catch (err) {
    console.error("Error completing upload:", err);
    alert("Error completing file upload");
  }
};


export const handleFileImport = async (selectedFile) => {
  const totalChunks = Math.ceil(selectedFile.size / chunkSize);
  try {
    // Send initial request
    const uploadID = await sendInitialRequest(selectedFile);
    const promises = [];
    
    const limit = pLimit(10); // Limit the number of concurrent uploads

    for (let i = 0; i < totalChunks; i++) {
      // Calculate the chunk's start and end positions
      const start = chunkSize * i;
      const end = Math.min(chunkSize * (i + 1), selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      // Push the upload promise to the promises array, using pLimit to control concurrency
      promises.push(limit(() => uploadChunk(chunk, i, uploadID)));
    }

    // Wait for all chunk uploads to complete
    await Promise.all(promises);

    // Confirm upload completion
    await confirmUploadCompletion(uploadID);
    return true;
  } catch (err) {
    console.error(err);
    throw new Error("Error uploading file", err);
  }
   
};
