import os

# Define the absolute directory path where files will be created
base_path = f"C:\\Users\\Noahh_p4mnp6\\source\\repos\\eBibleTheology.github.io\\Commentaries\\Gill"

# List of explicit file names to be created
file_names = [
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

# HTML content to insert into each file
html_template = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>eBibleTheology</title>
    <link rel="stylesheet" href="../../Styles.css" />
    <link rel="icon" href="../../cross_image.ico" />
  </head>
  <body>
    <div class="content">
      <nav>
        <p>
          <a href="../../index.html">Home</a> &gt;
          <a href="../../Commentaries/Gill/Contents.html">Gill</a>
        </p>
      </nav>

      <h2>Romans Commentary</h2>
      
    </div>
  </body>
</html>
"""

# File creation with content
for file_name in file_names:
    file_path = os.path.join(base_path, file_name)
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_template)
        print(f"Created: {file_path}")
    except Exception as e:
        print(f"Error creating file {file_path}: {e}")
