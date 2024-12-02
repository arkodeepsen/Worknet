import google.generativeai as genai
import os
import sys
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv('GEMINI_PRO_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

def prep_image(image_path):
    sample_file = genai.upload_file(path=image_path, display_name="Image")
    print(f"Uploaded file '{sample_file.display_name}' as: {sample_file.uri}")
    file = genai.get_file(name=sample_file.name)
    print(f"Retrieved File '{file.display_name}' as: {file.uri}")
    return sample_file

def extract_text_from_image(image_path, prompt):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content([image_path, prompt])
        return response.text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python handwritten.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    sample_file = prep_image(image_path)
text = extract_text_from_image(
    sample_file,
    "Extract the text from this image to create a structured and professional resume. Identify and label each section clearly, such as 'Name,' 'Contact Information,' 'Education,' 'Skills,' and 'Experience.' Ensure that the formatting is clean and organized, using bullet points or clear separation for each entry. Retain all content verbatim while ensuring clarity in presentation."
)
if text:
    print("Extracted Text:")
    print(text)
else:
    print("Failed to extract text from the image.")