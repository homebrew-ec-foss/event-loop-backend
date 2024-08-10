import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/create", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      if (response.ok) {
        setStatus("File processed successfully");
        setContent(text);
      } else {
        setStatus("Failed to upload file");
        setContent(text);
      }
    } catch (error) {
      setStatus("Error: " + error.message);
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {status && <p>{status}</p>}
      {content && (
        <div>
          <h2>Response:</h2>
          <pre>{content}</pre>
        </div>
      )}
    </div>
  );
}
