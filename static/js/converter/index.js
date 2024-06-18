const uploadButton = document.querySelector(".input_buttons_upload");
const fileInput = document.getElementById("fileInput");
const windowsInputFile = document.querySelector(".windows_input_file img");
const outputTextarea = document.querySelector(".windows_output_textarea");
const removeFile = document.querySelector(".input_buttons_icon");
const copyBtn = document.querySelector(".windows_output_copy");
const downloadBtn = document.querySelector(".windows_output_download");

const serverUrl = "/converter";
let accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
  window.location.href = "/login";
}

uploadButton.addEventListener("click", inputClick);
fileInput.addEventListener("change", upload);
removeFile.addEventListener("click", handlerRemoveFile);
copyBtn.addEventListener("click", copyToClipboard);
downloadBtn.addEventListener("click", downloadFile);

function inputClick() {
  console.log(1);
  fileInput.click();
}

function handlerRemoveFile() {
  windowsInputFile.src = "/static/images/form/image.svg";
  windowsInputFile.classList.remove("userImage");

  removeFile.disabled = true;

  uploadButton.removeEventListener("click", convertHandler);
  uploadButton.addEventListener("click", inputClick);
  uploadButton.textContent = "Загрузить файл";

  copyBtn.disabled = true;
  downloadBtn.disabled = true;
  outputTextarea.value = "";
}

function upload(event) {
  console.log(2);
  uploadButton.removeEventListener("click", inputClick);
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      windowsInputFile.src = e.target.result;
      windowsInputFile.classList.add("userImage");
    };
    reader.readAsDataURL(file);

    removeFile.disabled = false;
    uploadButton.textContent = "Конвертировать";

    uploadButton.addEventListener("click", convertHandler);
  }
}

function convertHandler() {
  uploadButton.removeEventListener("click", convertHandler);
  const file = fileInput.files[0];
  if (!localStorage.getItem("accessToken")) window.location = "/login";
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch(serverUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        } else if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
        outputTextarea.value = data.converted_code;
      })
      .catch((error) => {
        console.error("Ошибка:", error);
      });
  } else {
    alert("Пожалуйста, выберите файл.");
  }
}

function copyToClipboard() {
  outputTextarea.select();
  document.execCommand("copy");
  alert("Текст скопирован в буфер обмена!");
}

function downloadFile() {
  const blob = new Blob([outputTextarea.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "converted_code.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
