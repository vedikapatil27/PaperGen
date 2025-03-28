📚 Question Paper Generator ✨
Welcome to the Question Paper Generator! This project helps you generate question papers for different subjects, branches, and semesters. It allows you to customize the question paper by selecting questions from the database and generating a formatted Word document. 📝


🛠 Technologies Used:
Flask 🧨: A Python web framework for building the backend

MySQL 🔥: Database for storing subjects, questions, and user data

Python 🐍: Programming language for the logic and backend

JavaScript 💻: For frontend interactivity

HTML/CSS 🎨: For structuring and styling the web page

Docx 📄: To generate and download Word documents



📦 Features:
📄 Generate Question Papers: Automatically generate question papers based on selected criteria.

🔒 User Authentication: Login and signup functionalities to access the question paper generation tool.

📝 Database Integration: Pull questions from a MySQL database for various subjects and semesters.

🖼 Image Support: Upload images related to the questions and display them in the final document.

🎯 RBT Level, CO & PI: Keep track of each question's RBT level, CO, and PI for exam analysis.

📚 Branch & Semester-based Paper Generation: Customize question papers based on your branch and semester.



🔧 Installation Instructions:
Clone the repository:

git clone https://github.com/vedikapatil27/PaperGen.git

Navigate to the project folder:

cd PaperGen

Install dependencies:

Make sure you have Python 3.x installed. Then, run:

pip install -r requirements.txt

Set up environment variables:


Create a .env file in the project directory with the following contents (replace with your actual values):


MAIL_USERNAME=your_email@gmail.com

MAIL_PASSWORD=your_email_password

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=password

DB_NAME=question_bank




Run the app:

Finally, run the Flask app:

python app.py



🚀 How to Use:
Go to http://localhost:5000 in your browser after running the app.

Log in or sign up to access the question paper generator.

Select your subject, branch, semester, and exam details.

The system will automatically generate the question paper in Word format.

Download the generated question paper and use it for your exams.



🤝 Contributing:
We welcome contributions! If you find any issues or want to add new features, feel free to fork the repository and submit a pull request. Please ensure your code adheres to the project's guidelines.



📄 License:
This project is licensed under the MIT License - see the LICENSE file for details.
