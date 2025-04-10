import os

# Base directory (current folder)
BASE_DIR = "."

# Strings to replace
OLD_URL = "https://sarathi-backend-file.onrender.com"
NEW_URL = "https://sarathi-backend-file.onrender.com"

# Walk through all files and subdirectories
for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        file_path = os.path.join(root, file)

        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace and save only if OLD_URL is present
            if OLD_URL in content:
                print(f"Processing {file_path}")
                new_content = content.replace(OLD_URL, NEW_URL)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

        except (UnicodeDecodeError, PermissionError, IsADirectoryError):
            # Skip files that aren't readable text or accessible
            continue

print("Replacement complete.")
