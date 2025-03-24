import os
import re

def modify_verse_references(base_path, file_names):
    """
    Modify verse references in HTML files by:
    1. Finding references already in parentheses but with <a href> elements
    2. Removing the <a href> elements
    3. Keeping only the verse reference text in parentheses
    
    Args:
        base_path (str): Base directory containing the HTML files
        file_names (list): List of HTML file names to process
    """
    # Regular expression to match verse references with <a href> tags already in parentheses
    # Captures the text inside the <a> tag
    pattern = r'\(<a href="[^"]*">([^<]*)</a>\)'
    
    # Replacement - just the verse reference in parentheses
    replacement = r'(\1)'
    
    # Counter for tracking processed files
    files_processed = 0
    files_modified = 0
    
    for file_name in file_names:
        file_path = os.path.join(base_path, file_name)
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Warning: File not found: {file_path}")
            continue
        
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Apply the regex replacement
            modified_content = re.sub(pattern, replacement, content)
            
            # Check if any changes were made
            if content != modified_content:
                # Write the modified content back to the file
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(modified_content)
                
                files_modified += 1
                print(f"Modified: {file_name}")
            else:
                print(f"No changes needed in: {file_name}")
            
            files_processed += 1
            
        except Exception as e:
            print(f"Error processing {file_name}: {str(e)}")
    
    print(f"\nSummary: Processed {files_processed} files, modified {files_modified} files.")

# File paths from the example
base_path = f"C:\\Users\\Noahh_p4mnp6\\source\\repos\\eBibleTheology.github.io\\Commentaries\\Gill"
file_names = [
    "Introduction.html",
    "Romans_1_1-8.html", "Romans_1_9-15.html",
    "Romans_1_16-17.html",
    "Romans_1_18-32.html", "Romans_2_1-5.html", "Romans_2_6-11.html",
    "Romans_2_12-16.html", "Romans_2_17-24.html", "Romans_2_25-29.html",
    "Romans_3_1-4.html", "Romans_3_5-8.html", "Romans_3_9-18.html", "Romans_3_19-20.html",
    "Romans_3_21-26.html", "Romans_3_27-31.html",
    "Romans_4_1-8.html", "Romans_4_9-12.html", "Romans_4_13-17.html", "Romans_4_18-25.html",
    "Romans_5_1-11.html", "Romans_5_12-21.html",
    "Romans_6_1-14.html", "Romans_6_15-23.html",
    "Romans_7_1-6.html", "Romans_7_7-25.html",
    "Romans_8_1-11.html", "Romans_8_12-17.html", "Romans_8_18-30.html", "Romans_8_31-39.html",
    "Romans_9_1-5.html", "Romans_9_6-13.html", "Romans_9_14-18.html", "Romans_9_19-29.html", "Romans_9_30-33.html",
    "Romans_10_1-13.html", "Romans_10_14-21.html",
    "Romans_11_1-10.html", "Romans_11_11-24.html", "Romans_11_25-36.html",
    "Romans_12_1-2.html", "Romans_12_3-8.html", "Romans_12_9-21.html",
    "Romans_13_1-7.html", "Romans_13_8-14.html",
    "Romans_14_1-12.html", "Romans_14_13-23.html",
    "Romans_15_1-13.html", "Romans_15_14-21.html", "Romans_15_22-33.html",
    "Romans_16_1-16.html", "Romans_16_17-20.html", "Romans_16_21-23.html", "Romans_16_24-27.html"
]

# Execute the function
if __name__ == "__main__":
    print("Starting verse reference format modification...")
    modify_verse_references(base_path, file_names)
    print("Process completed.")