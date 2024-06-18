from pathlib import Path
import cv2
import pytesseract
from rich.console import Console
from rich.syntax import Syntax

class CodeCleaner:
    def __init__(self, code=None):
        self.code = code

    @staticmethod
    def clean_code(code: str):
        """Очистка кода от часто встречающихся проблем с форматированием."""
        lines = [line.strip() for line in code.split("\n") if line.strip() != ""]
        return "\n".join(lines)

    def clean(self):
        return self.clean_code(self.code)

def preprocess_image(image_path: str):
    """Предобработка изображения для улучшения распознавания текста."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  
    return binary

def convert_image_to_text(image_path: str):
    """Извлечение текста из изображения с использованием Tesseract OCR."""
    img = preprocess_image(image_path)
    custom_oem_psm_config = r"--oem 3 --psm 11" 
    return pytesseract.image_to_string(img, config=custom_oem_psm_config)

def print_code_with_syntax(code: str):
    """Вывод кода с подсветкой синтаксиса используя библиотеку Rich."""
    console = Console()
    syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
    console.print(syntax)

def save_code_to_file(code: str, file_path: str):
    """Сохранение обработанного кода в текстовый файл."""
    path = Path(file_path)
    path.write_text(code)
    return path
