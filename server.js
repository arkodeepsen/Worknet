const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf'); // You can use any PDF generation library
const multer = require('multer');
const FormData = require('form-data'); // Ensure this package is installed
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const { spawn } = require('child_process');
const csv = require('csv-parser');
const cors = require('cors'); // Add this line
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const fetch = require('node-fetch');
const helmet = require('helmet');
const mailjet = require('node-mailjet').apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();
app.use(cors()); // Add this line
const PORT = 3000;

// Proxy configuration
app.use('/api', createProxyMiddleware({
  target: 'https://ai-background-remover.p.rapidapi.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api from the request path
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-rapidapi-key', process.env.RAPIDAPI_KEY);
    proxyReq.setHeader('x-rapidapi-host', 'ai-background-remover.p.rapidapi.com');
  }
}));

// Function to get database connection
function getDbConnection() {
  return new sqlite3.Database('database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
          console.error(err.message);
      }
  });
}

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/*const agent = new https.Agent({
    rejectUnauthorized: false // Ignore invalid SSL certificates
});*/

// Proxy configuration
app.use('/api', createProxyMiddleware({
  target: 'https://ai-background-remover.p.rapidapi.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api from the request path
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-rapidapi-key', process.env.RAPIDAPI_KEY);
    proxyReq.setHeader('x-rapidapi-host', 'ai-background-remover.p.rapidapi.com');
  }
}));

// Serve static files
app.use(express.static('assets'));
app.use(express.static('style'));
app.use(express.static('scripts'));
app.use(express.static(__dirname));
app.use(express.json());

// Set up SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
console.log('Database path:', dbPath);

// Verify that the SQLite database file exists
if (!fs.existsSync(dbPath)) {
  console.log('SQLite database file does not exist. Creating new database.');
} else {
  console.log('SQLite database file exists.');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create 'users' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  } else {
    console.log('Users table is ready');
  }
});

// Check if 'verification' table exists and create it if it doesn't
db.run(`
  CREATE TABLE IF NOT EXISTS verification (
    email TEXT PRIMARY KEY,
    verificationCode TEXT,
    verificationExpires INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating verification table:', err);
  } else {
    console.log('Verification table is ready');
  }
});

// Create 'user_details' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS user_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT,
    profilePicture TEXT,
    email TEXT NOT NULL,
    contact TEXT NOT NULL,
    city TEXT NOT NULL,
    gender TEXT,
    languages TEXT,
    type TEXT,
    courses TEXT,
    college TEXT,
    stream TEXT,
    startYear INTEGER,
    endYear INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`, (err) => {
  if (err) {
    console.error('Error creating user_details table:', err);
  } else {
    console.log('User details table is ready');
  }
});
// Check if 'skills' column exists before adding it
db.all("PRAGMA table_info(user_details);", (err, columns) => {
  if (err) {
    console.error('Error fetching table info:', err.message);
    return;
  }

  const columnExists = columns.some(column => column.name === 'skills');
  if (!columnExists) {
    db.run(`
      ALTER TABLE user_details
      ADD COLUMN skills TEXT;
    `, (err) => {
      if (err) {
        console.error('Error adding skills column:', err.message);
      } else {
        console.log('Skills column added successfully.');
      }
    });
  } else {
    console.log('Skills column already exists.');
  }
});


// Set up multer for general file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Unique filename
  }
});
const upload = multer({ storage: storage });

// Set up multer for profile picture uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'profile_uploads/');  // Directory for profile pictures
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-profile-' + file.originalname);  // Unique filename for profile picture
  }
});
const uploadProfile = multer({ storage: profileStorage });

// Default route
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Route to serve the signup page
app.get('/signup', (req, res) => {
  res.render('signup', { secretKey: process.env.SECRET_KEY });
});

// Route to serve the login page
app.get('/signin', (req, res) => {
  res.render('signin', { secretKey: process.env.SECRET_KEY });
});
app.get('/login', (req, res) => {
  res.redirect('/signin');
});

// Route to serve the main page
app.get('/main', (req, res) => {
  res.render('main');
});

app.get('/home', (req, res) => {
  res.render('index');
});

app.get('/index', (req, res) => {
  res.redirect('/home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

// Route to serve the dashboard page
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/reset-password', (req, res) => {
  res.render('reset-password');
});

app.get('/form', (req, res) => {
  res.render('form');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/resume', (req, res) => {
  res.render('resume');
});

app.get('/resume-builder', (req, res) => {
  res.redirect('/resume-generator');
});

app.get('/ai-tools', (req, res) => {
  res.render('ai-tools');
});

app.get('/job-search', (req, res) => {
  res.redirect('/main');
});

app.get('/ai-tool', (req, res) => {
  res.redirect('/ai-tools');
});

app.get('/ai', (req, res) => {
  res.redirect('/ai-tools');
});

app.get('/resume-generator', (req, res) => {
  res.render('resume-generator');
});

app.get('/job-details', (req, res) => {
  res.render('job-details');
});

app.get('/user', (req, res) => {
  res.render('user');
});

app.get('/handwritten', (req, res) => {
  res.render('handwritten-ai');
});

app.get('/handwritten-ai', (req, res) => {
  res.redirect('/handwritten');
});

app.get('/image-enhancer', (req, res) => {
  res.render('image-ai');
});

app.get('/image-ai', (req, res) => {
  res.redirect('/image-enhancer');
});

app.get('/image-enhancement', (req, res) => {
  res.redirect('/image-enhancer');
});

app.get('/image-background-removal', (req, res) => {
  res.redirect('/image-enhancer');
});

app.get('/404', (req, res) => {
  res.render('404');
});

// Create the image_history table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS image_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    originalImagePath TEXT,
    processedImagePath TEXT,
    originalImageHash TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating image_history table:', err.message);
  } else {
    console.log('image_history table is ready');
  }
});

// Endpoint for uploading and processing images
app.post('/upload-image', upload.single('file'), async (req, res) => {
  const userId = req.body.userId;
  const filePath = req.file.path;

  console.log('File path:', filePath);

  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    console.error('File not found at path:', filePath);
    return res.json({ success: false, message: 'File not found.' });
  }

  // Calculate the hash of the original image
  const originalImageBuffer = fs.readFileSync(filePath);
  const originalImageHash = crypto.createHash('md5').update(originalImageBuffer).digest('hex');

  // Check if the image has already been processed
  const checkQuery = `SELECT * FROM image_history WHERE originalImageHash = ?`;
  db.get(checkQuery, [originalImageHash], async (err, row) => {
    if (err) {
      console.error('Error checking image history:', err);
      return res.json({ success: false, message: 'Error checking image history.' });
    }

    if (row) {
      // Image has already been processed
      return res.json({ success: false, message: 'This image has already been processed.', processedImagePath: row.processedImagePath });
    }

// Proceed with image enhancement
const url = 'https://ai-background-remover.p.rapidapi.com/image/matte/v1';

// Ensure the path is correct
const correctFilePath = filePath.replace(/\\/g, '/'); // Ensure forward slashes
console.log('Using file path:', correctFilePath);

// Append the image file to the FormData
const data = new FormData();
data.append('image', fs.createReadStream(correctFilePath));

// Set up the API request
const options = {
  method: 'POST',
  url: url,
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Ensure you set this in your environment
    'x-rapidapi-host': 'ai-background-remover.p.rapidapi.com',
    ...data.getHeaders(),
  },
  data: data,
  responseType: 'arraybuffer', // <-- Add this line to specify response type
};

console.log('Sending request with options:', options);

try {
  console.log('Sending request to API:', url);
  const response = await axios(options);

  // Check the response and handle accordingly
  if (response.status !== 200) {
    console.error('API response error:', response.data);
    return res.json({ success: false, message: 'Failed to process image.' });
  }

  const processedImagePath = path.join('uploads', `processed-${Date.now()}.png`);
  
  // Save the processed image correctly
  fs.writeFileSync(processedImagePath, response.data); // Save the image buffer

  // Save the original and processed image paths to the database
  const query = `INSERT INTO image_history (userId, originalImagePath, processedImagePath, originalImageHash) VALUES (?, ?, ?, ?)`;
  db.run(query, [userId, filePath, processedImagePath, originalImageHash], function (err) {
    if (err) {
      console.error('Error saving image to database:', err);
      res.json({ success: false, message: 'Failed to save image.' });
    } else {
      res.json({ success: true, originalImagePath: filePath, processedImagePath: processedImagePath });
    }
  });
} catch (error) {
  console.error('Error:', error);
  res.json({ success: false, message: 'An error occurred while enhancing the image.', error: error.message });
}
  });
});

// Route to get the history of enhanced images for a user
app.get('/get-image-history/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT * FROM image_history WHERE userId = ?`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching image history:', err);
      res.json({ success: false, message: 'Failed to fetch image history.' });
    } else {
      res.json({ success: true, history: rows });
    }
  });
});

// Create 'handwritten_ai' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS handwritten_ai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    image TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`, (err) => {
  if (err) {
    console.error('Error creating handwritten_ai table:', err);
  } else {
    console.log('handwritten_ai table is ready');
  }
});

// Route to serve the handwritten AI page
app.get('/handwritten-ai', (req, res) => {
  res.render('handwritten-ai');
});

// Route to handle file upload and text extraction
app.post('/upload-handwritten', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const userId = req.body.userId;

  // Call the Python script to process the image and extract text
  const pythonProcess = spawn('python', ['routes/handwritten.py', filePath]);

  pythonProcess.stdout.on('data', (data) => {
    const result = data.toString();
    res.json({ success: true, text: result, image: req.file.filename });
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
    res.json({ success: false, message: 'Error processing the image' });
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    // Optionally, delete the uploaded file after processing
    // fs.unlink(filePath, (err) => {
    //   if (err) {
    //     console.error(`Error deleting file: ${err}`);
    //   }
    // });
  });
});

// Route to save the extracted text and image information to the database
app.post('/save-handwritten', (req, res) => {
  const { userId, image, text } = req.body;

  // Check if the entry already exists
  db.get(`SELECT * FROM handwritten_ai WHERE userId = ? AND image = ?`, [userId, image], (err, row) => {
    if (err) {
      console.error('Error querying database:', err);
      res.json({ success: false });
    } else if (row) {
      // Entry already exists, do not insert again
      res.json({ success: true });
    } else {
      // Insert new entry
      db.run(`INSERT INTO handwritten_ai (userId, image, text) VALUES (?, ?, ?)`, [userId, image, text], function(err) {
        if (err) {
          console.error('Error saving to database:', err);
          res.json({ success: false });
        } else {
          res.json({ success: true });
        }
      });
    }
  });
});

// Route to delete a specific entry from the database
app.delete('/delete-handwritten', (req, res) => {
  const { userId, image } = req.body;

  db.run(`DELETE FROM handwritten_ai WHERE userId = ? AND image = ?`, [userId, image], function(err) {
    if (err) {
      console.error('Error deleting from database:', err);
      res.json({ success: false });
    } else if (this.changes === 0) {
      // No entry found to delete
      res.json({ success: false, message: 'No entry found' });
    } else {
      // Entry successfully deleted
      res.json({ success: true });
    }
  });
});

// Route to get the history of previous generations for a user
app.get('/get-handwritten-history/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all(`SELECT * FROM handwritten_ai WHERE userId = ?`, [userId], (err, rows) => {
    if (err) {
      console.error('Error querying database:', err);
      res.json({ success: false });
    } else {
      res.json({ success: true, history: rows });
    }
  });
});

// Route to send verification code
app.post('/send-verification-code', (req, res) => {
  const { email, token } = req.body;

  // Verify reCAPTCHA token
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  fetch(verificationUrl, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
      }

      // Check if a verification code was sent within the last 10 minutes
      const checkQuery = `SELECT verificationExpires FROM verification WHERE email = ?`;
      db.get(checkQuery, [email], (err, row) => {
        if (err) {
          console.error('Error checking verification code expiry:', err);
          return res.status(500).json({ message: 'Error processing request.' });
        }

        if (row && row.verificationExpires > Date.now()) {
          // Verification code is still active
          return res.json({
            message: 'A verification code was already sent recently. Please wait 10 minutes before requesting a new one.',
            showModal: true,
            modalContent: {
              title: 'Verification Code Already Sent',
              body: 'A verification code was already sent to your email. Please check your inbox and enter the code to verify your email address. You can request a new code after 10 minutes.',
              buttonText: 'OK'
            }
          });
        }

        // Generate a new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const expiry = Date.now() + 600000; // 10 minutes

        const upsertQuery = `
          INSERT INTO verification (email, verificationCode, verificationExpires)
          VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            verificationCode = excluded.verificationCode,
            verificationExpires = excluded.verificationExpires
        `;
        db.run(upsertQuery, [email, verificationCode, expiry], function (err) {
          if (err) {
            console.error('Error updating verification table:', err);
            return res.status(500).json({ message: 'Error processing request.' });
          }

          // Read the logo file and encode it in base64
          const logoPath = path.join(__dirname, 'assets', 'worknet.png');
          const logoContent = fs.readFileSync(logoPath).toString('base64');

          // Send email with Mailjet
          const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [{
              From: { Email: process.env.EMAIL, Name: 'WorkNet' },
              To: [{ Email: email }],
              ReplyTo: { Email: process.env.EMAIL2, Name: 'WorkNet Support' }, // Add this line to include CC
              Subject: 'WorkNet Email Verification Code',
              HTMLPart: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                  <h2>WorkNet Email Verification</h2>
                  <p>Thank you for signing up with WorkNet!</p>
                  <p>Your verification code is:</p>
                  <h1 style="color: #4CAF50;">${verificationCode}</h1>
                  <p>Please enter this code on the signup page to verify your email address.</p>
                  <p>If you did not request this, please ignore this email.</p>
                  <br>
                  <img src="cid:worknet_logo" alt="WorkNet Logo" style="width: 100px; height: auto;">
                  <p style="color: #888;">&copy; ${new Date().getFullYear()} WorkNet. All rights reserved.</p>
                </div>
              `,
              Attachments: [
                {
                  ContentType: 'image/png',
                  Filename: 'worknet.png',
                  Base64Content: logoContent, // Base64 encoded logo image
                  ContentID: 'worknet_logo', // same as the cid in the HTML part
                  Disposition: 'inline' // inline attachment for embedding
                }
              ]
            }]
          });
          request
            .then(() => {
              // Code to trigger the modal on the client-side
              res.json({
                message: 'Verification code sent successfully.',
                showModal: true,
                modalContent: {
                  title: 'Verification Code Sent',
                  body: 'A verification code has been sent to your email. Please check your inbox and enter the code to verify your email address.',
                  buttonText: 'OK'
                }
              });
            })
            .catch((error) => {
              console.error('Error sending email:', error);
              res.status(500).json({ message: 'Error sending email.' });
            });
        });
      });
    })
    .catch(error => {
      console.error('Error verifying reCAPTCHA:', error);
      res.status(500).json({ message: 'Error verifying reCAPTCHA.' });
    });
});

// Route to handle signup requests
app.post('/signup', async (req, res) => {
  const { fullName, username, email, phone, password, verificationCode } = req.body;
  console.log('Signup form data received:', req.body);

  const query = `SELECT * FROM verification WHERE email = ? AND verificationCode = ? AND verificationExpires > ?`;
  db.get(query, [email, verificationCode, Date.now()], async (err, row) => {
    if (err || !row) {
      return res.status(400).json({ message: 'Verification code is invalid or has expired.' });
    }

    try {
      // Decrypt the password
      const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

      // Hash the password
      const hashedPassword = await bcrypt.hash(decryptedPassword, 10);

      const insertQuery = `INSERT INTO users (fullName, username, email, phone, password) VALUES (?, ?, ?, ?, ?)`;
      db.run(insertQuery, [fullName, username, email, phone, hashedPassword], function (err) {
        if (err) {
          console.error('Error inserting data:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Username or Email already exists. Please log in.' });
          } else {
            return res.status(500).json({ message: 'Error signing up.' });
          }
        } else {
          console.log('User signed up:', username);
          res.json({ message: 'Signup successful! Redirecting to signin in 1 second.', redirect: '/signin', delay: 1000 });
        }
      });
    } catch (error) {
      console.error('Error decrypting or hashing password:', error);
      res.status(500).json({ message: 'Error signing up.' });
    }
  });
});

// Route to handle forgot password requests
app.post('/forgot-password', (req, res) => {
  const { email, token } = req.body;

  // Verify reCAPTCHA token
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  fetch(verificationUrl, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        return res.status(400).json({
          message: 'reCAPTCHA verification failed. Please try again.',
          modalContent: {
            title: 'reCAPTCHA Verification Failed',
            body: 'reCAPTCHA verification failed. Please try again.',
            buttonText: 'OK'
          }
        });
      }

      // Check if a verification code was sent within the last 10 minutes
      const checkQuery = `SELECT verificationExpires FROM verification WHERE email = ?`;
      db.get(checkQuery, [email], (err, row) => {
        if (err) {
          console.error('Error checking verification code expiry:', err);
          return res.status(500).json({
            message: 'Error processing request.',
            modalContent: {
              title: 'Error',
              body: 'There was an error processing your request. Please try again later.',
              buttonText: 'OK'
            }
          });
        }

        if (row && row.verificationExpires > Date.now()) {
          // Verification code is still active
          return res.json({
            message: 'A verification code was already sent recently. Please wait 10 minutes before requesting a new one.',
            modalContent: {
              title: 'Verification Code Already Sent',
              body: 'A verification code was already sent to your email. Please check your inbox and enter the code to reset your password. You can request a new code after 10 minutes.',
              buttonText: 'OK'
            }
          });
        }

        // Generate a new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const expiry = Date.now() + 600000; // 10 minutes

        const upsertQuery = `
          INSERT INTO verification (email, verificationCode, verificationExpires)
          VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            verificationCode = excluded.verificationCode,
            verificationExpires = excluded.verificationExpires
        `;
        db.run(upsertQuery, [email, verificationCode, expiry], function (err) {
          if (err) {
            console.error('Error updating verification table:', err);
            return res.status(500).json({
              message: 'Error processing request.',
              modalContent: {
                title: 'Error',
                body: 'There was an error processing your request. Please try again later.',
                buttonText: 'OK'
              }
            });
          }

          // Read the logo file and encode it in base64
          const logoPath = path.join(__dirname, 'assets', 'worknet.png');
          const logoContent = fs.readFileSync(logoPath).toString('base64');

            // Send email with Mailjet
            const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [{
              From: { Email: process.env.EMAIL, Name: 'WorkNet' },
              To: [{ Email: email }],
              ReplyTo: { Email: process.env.EMAIL2, Name: 'WorkNet Support' }, // Add this line to include CC
              Subject: 'WorkNet Password Reset Verification Code',
              HTMLPart: `
              <div style="font-family: Arial, sans-serif; text-align: center;">
              <h2>WorkNet Password Reset</h2>
              <p>You requested a password reset for your WorkNet account.</p>
              <p>Your verification code is:</p>
              <h1 style="color: #4CAF50;">${verificationCode}</h1>
              <p>Please enter this code on the password reset page to reset your password.</p>
              <p>If you did not request this, please ignore this email.</p>
              <br>
              <img src="cid:worknet_logo" alt="WorkNet Logo" style="width: 100px; height: auto;">
              <p style="color: #888;">&copy; ${new Date().getFullYear()} WorkNet. All rights reserved.</p>
              </div>
              `,
              Attachments: [
              {
              ContentType: 'image/png',
              Filename: 'worknet.png',
              Base64Content: logoContent, // Base64 encoded logo image
              ContentID: 'worknet_logo', // same as the cid in the HTML part
              Disposition: 'inline' // inline attachment for embedding
              }
              ]
            }]
            });

            request
            .then(() => {
              res.json({
                message: 'Verification code sent successfully. Please check your email.',
                modalContent: {
                  title: 'Verification Code Sent',
                  body: 'A verification code has been sent to your email. Please check your inbox and enter the code to reset your password.',
                  buttonText: 'OK'
                }
              });
            })
            .catch((error) => {
              console.error('Error sending email:', error);
              res.status(500).json({
                message: 'Error sending email.',
                modalContent: {
                  title: 'Error',
                  body: 'There was an error sending the email. Please try again later.',
                  buttonText: 'OK'
                }
              });
            });
        });
      });
    })
    .catch(error => {
      console.error('Error verifying reCAPTCHA:', error);
      res.status(500).json({
        message: 'Error verifying reCAPTCHA.',
        modalContent: {
          title: 'Error',
          body: 'There was an error verifying reCAPTCHA. Please try again later.',
          buttonText: 'OK'
        }
      });
    });
});

// Route to handle password reset requests
app.post('/reset-password', (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  const query = `SELECT * FROM verification WHERE email = ? AND verificationCode = ? AND verificationExpires > ?`;
  db.get(query, [email, verificationCode, Date.now()], async (err, row) => {
    if (err || !row) {
      return res.status(400).json({
        message: 'Verification code is invalid or has expired.',
        modalContent: {
          title: 'Invalid Verification Code',
          body: 'The verification code you entered is invalid or has expired. Please try again.',
          buttonText: 'OK'
        }
      });
    }

    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;
      db.run(updateQuery, [hashedPassword, email], function (err) {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({
            message: 'Error resetting password.',
            modalContent: {
              title: 'Error',
              body: 'There was an error resetting your password. Please try again later.',
              buttonText: 'OK'
            }
          });
        } else {
          console.log('Password reset for:', email);
          res.json({
            message: 'Password reset successful! You can now log in with your new password.',
            modalContent: {
              title: 'Password Reset Successful',
              body: 'Your password has been reset successfully. You can now log in with your new password.',
              buttonText: 'OK'
            },
            redirect: '/signin',
            delay: 1000
          });
        }
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({
        message: 'Error resetting password.',
        modalContent: {
          title: 'Error',
          body: 'There was an error resetting your password. Please try again later.',
          buttonText: 'OK'
        }
      });
    }
  });
});

// Route to handle login requests using email and password
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login form data received:', req.body);

  try {
    // Decrypt the password
    const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

    const query = `SELECT * FROM users WHERE email = ?`;

    db.get(query, [email], async (err, row) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Error logging in.' });
      }

      if (row) {
        // Compare the hashed password
        const match = await bcrypt.compare(decryptedPassword, row.password);
        if (match) {
          console.log('Login successful for user:', email);
          res.json({ 
            message: 'Login successful! Redirecting to main page in 1 second.',
            userId: row.id, // Send the userId to the client
            redirect: '/home', // Redirect to the main page
            delay: 1000 
          });
        } else {
          res.status(401).json({ message: 'Invalid email or password.' });
        }
      } else {
        res.status(401).json({ message: 'Invalid email or password.' });
      }
    });
  } catch (error) {
    console.error('Error decrypting password:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

app.post('/submit-details', uploadProfile.single('profilePicture'), (req, res) => {
  try {
    const { firstName, lastName, email, contact, city, gender, languages, type, courses, college, stream, startYear, endYear, skills } = req.body; // Added skills
    const profilePicturePath = req.file ? req.file.path : null;

    console.log('Received form data:', req.body);
    console.log('File upload:', req.file);

    if (!profilePicturePath) {
      console.error('No profile picture uploaded.');
      //return res.status(400).json({ message: 'Profile picture is required.' });
    }

    // Fetch userId based on the email
    const getUserIdQuery = `SELECT id FROM users WHERE email = ?`;
    db.get(getUserIdQuery, [email], (err, row) => {
      if (err) {
        console.error('Error fetching userId:', err);
        return res.status(500).json({ message: 'Error fetching userId.' });
      }

      if (!row) {
        console.error('User not found for email:', email);
        return res.status(404).json({ message: 'User not found.' });
      }

      const userId = row.id;
      console.log(`Found user with id: ${userId}, preparing to check user details.`);

      // Check if user details already exist in the user_details table
      const checkDetailsQuery = `SELECT * FROM user_details WHERE userId = ?`;
      db.get(checkDetailsQuery, [userId], (err, detailsRow) => {
        if (err) {
          console.error('Error checking user details:', err);
          return res.status(500).json({ message: 'Error checking user details.' });
        }

        // Determine profile picture: use the uploaded one or retain existing one
        const profilePicturePath = req.file ? req.file.path : (detailsRow ? detailsRow.profilePicture : null);

        if (detailsRow) {
          // User details exist, perform update
          console.log('User details exist, updating details.');

          const updateQuery = `
            UPDATE user_details 
            SET firstName = ?, lastName = ?, profilePicture = ?, email = ?, contact = ?, city = ?, gender = ?, languages = ?, type = ?, courses = ?, college = ?, stream = ?, startYear = ?, endYear = ?, skills = ?
            WHERE userId = ?`;

          db.run(updateQuery, [firstName, lastName, profilePicturePath || detailsRow.profilePicture, email, contact, city, gender, languages, type, courses, college, stream, startYear, endYear, skills, userId], function (err) {
            if (err) {
              console.error('Error updating user details:', err);
              return res.status(500).json({ message: 'Error updating user details.' });
            } else {
              console.log('User details updated successfully for userId:', userId);
              return res.json({ message: 'Details updated successfully!', redirect: '/dashboard' });
            }
          });

        } else {
          // User details don't exist, insert new details
          console.log('No existing user details, inserting new details.');

          const insertQuery = `
            INSERT INTO user_details (
              userId, firstName, lastName, profilePicture, email, contact, city, gender, languages, type, courses, college, stream, startYear, endYear, skills
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          db.run(insertQuery, [userId, firstName, lastName, profilePicturePath, email, contact, city, gender, languages, type, courses, college, stream, startYear, endYear, skills], function(err) {
            if (err) {
              console.error('Error inserting user details into user_details:', err);
              return res.status(500).json({ message: 'Error saving user details.' });
            } else {
              console.log('User details saved successfully for userId:', userId);
              return res.json({ message: 'Details submitted successfully!', redirect: '/dashboard' });
            }
          });
        }
      });
    });
  } catch (err) {
    console.error('Unexpected error during form submission:', err);
    return res.status(500).json({ message: 'Server error occurred.' });
  }
});

// Route to handle user details update
app.post('/update-user-details', async (req, res) => {
  const { userId, firstName, lastName, email, contact, city, gender, languages, type, courses, college, stream, startYear, endYear } = req.body;

  try {
    // Find the user by ID and update their details
    await db.run(`
      UPDATE user_details SET 
        firstName = ?, 
        lastName = ?, 
        email = ?, 
        contact = ?, 
        city = ?, 
        gender = ?, 
        languages = ?, 
        type = ?, 
        courses = ?, 
        college = ?, 
        stream = ?, 
        startYear = ?, 
        endYear = ?
      WHERE userId = ?`, 
      [firstName, lastName, email, contact, city, gender, languages.split(','), type, courses.split(','), college, stream, startYear, endYear, userId],
      function(err) {
        if (err) {
          console.error('Error updating user details:', err);
          return res.status(500).send('Error updating details');
        } else {
          res.status(200).send('Details updated successfully');
        }
      });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).send('Error updating details');
  }
});

// Fetch User Details Endpoint
app.get('/user-details/:userId', (req, res) => {
    const userId = req.params.userId;

    db.get(`SELECT * FROM user_details WHERE userId = ?`, [userId], (err, userDetails) => {
        if (err) {
            console.error('Error fetching user details:', err.message);
            return res.status(500).json({ success: false, error: 'Failed to fetch user details' });
        }

        if (userDetails) {
            db.all(`SELECT * FROM experiences WHERE userId = ?`, [userId], (err, experiences) => {
                if (err) {
                    console.error('Error fetching experiences:', err.message);
                    return res.status(500).json({ success: false, error: 'Failed to fetch experiences' });
                }

                db.all(`SELECT * FROM education WHERE userId = ?`, [userId], (err, education) => {
                    if (err) {
                        console.error('Error fetching education:', err.message);
                        return res.status(500).json({ success: false, error: 'Failed to fetch education' });
                    }

                    res.status(200).json({ success: true, userDetails: { ...userDetails, experiences, education } });
                });
            });
        } else {
            res.status(404).json({ success: false, error: 'User details not found' });
        }
    });
});

// Route to get user details by email
app.get('/user-details/:email', (req, res) => {
  const { email } = req.params;

  const query = `SELECT * FROM user_details WHERE email = ?`;
  db.get(query, [email], (err, row) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ message: 'Error fetching user details.' });
    }

    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'User details not found.' });
    }
  });
});

// Route to get the most recent user details based on userId
app.get('/get-user-details/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `SELECT * FROM user_details WHERE userId = ? ORDER BY id DESC LIMIT 1`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ message: 'Error fetching user details.' });
    }

    if (row) {
      res.json(row);  // Return the most recent user details
    } else {
      res.status(404).json({ message: 'No user details found for this user.' });
    }
  });
});

app.get('/get-email/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `SELECT email FROM users WHERE id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching email:', err);
      return res.status(500).json({ message: 'Error fetching email.' });
    }

    if (row) {
      res.json(row);  // Return the email
    } else {
      res.status(404).json({ message: 'No user found with this ID.' });
    }
  });
});
// Route to get the username based on userId
app.get('/get-username/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `SELECT username FROM users WHERE id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching username:', err);
      return res.status(500).json({ message: 'Error fetching username.' });
    }

    if (row) {
      res.json(row);  // Return the username
    } else {
      res.status(404).json({ message: 'No user found with this ID.' });
    }
  });
});

// Route to get user details by the largest id
app.get('/get-user-details', (req, res) => {
  const query = `SELECT * FROM user_details ORDER BY id DESC LIMIT 1`;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ message: 'Error fetching user details.' });
    }

    if (row) {
      res.json(row);  // Return the user details
    } else {
      res.status(404).json({ message: 'No user details found.' });
    }
  });
});

// Create the resume table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS resume (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    template TEXT,
    firstName TEXT,
    lastName TEXT,
    city TEXT,
    country TEXT,
    pinCode TEXT,
    experienceLevel TEXT, 
    skills TEXT,
    contact TEXT,
    email TEXT,
    summary TEXT,
    job_descriptions TEXT,
    enableProfilePic TEXT
  )
`, (err) => {
  if (err) {
    console.error('Error creating resume table:', err.message);
  } else {
    console.log('resume table created or already exists.');
  }
});

// Check if 'job_descriptions' column exists before adding it
db.all("PRAGMA table_info(resume);", (err, columns) => {
  if (err) {
    console.error('Error fetching table info:', err.message);
    return;
  }

  const columnExists = columns.some(column => column.name === 'job_descriptions');
  if (!columnExists) {
    db.run(`
      ALTER TABLE resume
      ADD COLUMN job_descriptions TEXT;
    `, (err) => {
      if (err) {
        console.error('Error adding job_descriptions column:', err.message);
      } else {
        console.log('job_descriptions column added successfully.');
      }
    });
  } else {
    console.log('job_descriptions column already exists.');
  }
});

// Create the education table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    degree TEXT,
    institution TEXT,
    graduationYear TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating education table:', err.message);
  } else {
    console.log('education table created or already exists.');
  }
});
// Check if 'specialization' column exists before adding it
db.all("PRAGMA table_info(education);", (err, columns) => {
  if (err) {
    console.error('Error fetching table info:', err.message);
    return;
  }

  const columnExists = columns.some(column => column.name === 'specialization');
  if (!columnExists) {
    db.run(`
      ALTER TABLE education
      ADD COLUMN specialization TEXT;
    `, (err) => {
      if (err) {
        console.error('Error adding specialization column:', err.message);
      } else {
        console.log('Specialization column added successfully.');
      }
    });
  } else {
    console.log('Specialization column already exists.');
  }
});

// Create the experience table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    jobTitle TEXT,
    employer TEXT,
    location TEXT,
    startDate TEXT,
    endDate TEXT,
    currentWork BOOLEAN,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating experience table:', err.message);
  } else {
    console.log('experience table created or already exists.');
  }
});

// Create the websites table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    websiteName TEXT,
    websiteLink TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating websites table:', err.message);
  } else {
    console.log('websites table created or already exists.');
  }
});

// Create the certifications table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    certificationName TEXT,
    issuingOrg TEXT,
    issueDate TEXT,
    certificationLink TEXT,
    credentialId TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating certifications table:', err.message);
  } else {
    console.log('certifications table created or already exists.');
  }
});

// Create the languages table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    languageName TEXT,
    proficiencyLevel TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating languages table:', err.message);
  } else {
    console.log('languages table created or already exists.');
  }
});

// Create the accomplishments table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS accomplishments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    accomplishmentName TEXT,
    accomplishmentOrg TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating accomplishments table:', err.message);
  } else {
    console.log('accomplishments table created or already exists.');
  }
});

// Create the affiliations table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS affiliations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    membershipType TEXT,
    affiliationOrg TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating affiliations table:', err.message);
  } else {
    console.log('affiliations table created or already exists.');
  }
});

// Create the additional_info table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS additional_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resumeId INTEGER,
    hobbies TEXT,
    additionalInfo TEXT,
    FOREIGN KEY (resumeId) REFERENCES resume(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating additional_info table:', err.message);
  } else {
    console.log('additional_info table created or already exists.');
  }
});

// Endpoint to submit resume
app.post('/submit-resume', upload.none(), (req, res) => {
    const { userId, firstName, lastName, city, country, pinCode, contact, email, summary, experienceLevel, skills, educationDegree, institution, specialization, graduationYear, jobTitle, employer, location, startDate, endDate, currentWork, selectedTemplate,
      jobDescriptions, enableProfilePic } = req.body;

    console.log('Received form data:', req.body); // Log the received form data

    // Insert resume details
    db.run(`INSERT INTO resume (userId, firstName, lastName, city, country, pinCode, contact, email, summary, experienceLevel, skills, template, job_descriptions, enableProfilePic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [userId, firstName, lastName, city, country, pinCode, contact, email, summary, experienceLevel, skills, selectedTemplate, JSON.stringify(jobDescriptions), enableProfilePic], function(err) {
        if (err) {
            console.error('Error inserting resume:', err.message);
            return res.status(500).json({ message: 'Error inserting resume.' });
        }
        const resumeId = this.lastID;

        // Insert education details
        if (Array.isArray(educationDegree)) {
            educationDegree.forEach((degree, index) => {
                db.run(`INSERT INTO education (resumeId, degree, institution, graduationYear, specialization) VALUES (?, ?, ?, ?, ?)`, 
                    [resumeId, degree, institution[index], graduationYear[index], specialization[index]], function(err) {
                    if (err) {
                        console.error('Error inserting education:', err.message);
                    }
                });
            });
        } else {
            db.run(`INSERT INTO education (resumeId, degree, institution, graduationYear, specialization) VALUES (?, ?, ?, ?, ?)`, 
                [resumeId, educationDegree, institution, graduationYear, specialization], function(err) {
                if (err) {
                    console.error('Error inserting education:', err.message);
                }
            });
        }

        // Insert experience details
        if (Array.isArray(jobTitle)) {
            jobTitle.forEach((title, index) => {
                db.run(`INSERT INTO experience (resumeId, jobTitle, employer, location, startDate, endDate, currentWork) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                    [resumeId, title, employer[index], location[index], startDate[index], endDate[index], currentWork[index] ? 1 : 0], function(err) {
                    if (err) {
                        console.error('Error inserting experience:', err.message);
                    }
                });
            });
        } else {
            db.run(`INSERT INTO experience (resumeId, jobTitle, employer, location, startDate, endDate, currentWork) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [resumeId, jobTitle, employer, location, startDate, endDate, currentWork ? 1 : 0], function(err) {
                if (err) {
                    console.error('Error inserting experience:', err.message);
                }
            });
        }

        // Insert websites details
        if (req.body.websiteName) {
            const websiteNames = Array.isArray(req.body.websiteName) ? req.body.websiteName : [req.body.websiteName];
            const websiteLinks = Array.isArray(req.body.websiteLink) ? req.body.websiteLink : [req.body.websiteLink];
            websiteNames.forEach((name, index) => {
                db.run(`INSERT INTO websites (resumeId, websiteName, websiteLink) VALUES (?, ?, ?)`, 
                    [resumeId, name, websiteLinks[index]], function(err) {
                    if (err) {
                        console.error('Error inserting website:', err.message);
                    }
                });
            });
        }

        // Insert certifications details
        if (req.body.certificationName) {
            const certificationNames = Array.isArray(req.body.certificationName) ? req.body.certificationName : [req.body.certificationName];
            const issuingOrgs = Array.isArray(req.body.issuingOrg) ? req.body.issuingOrg : [req.body.issuingOrg];
            const issueDates = Array.isArray(req.body.issueDate) ? req.body.issueDate : [req.body.issueDate];
            const certificationLinks = Array.isArray(req.body.certificationLink) ? req.body.certificationLink : [req.body.certificationLink];
            const credentialIds = Array.isArray(req.body.credentialId) ? req.body.credentialId : [req.body.credentialId];
            certificationNames.forEach((name, index) => {
                db.run(`INSERT INTO certifications (resumeId, certificationName, issuingOrg, issueDate, certificationLink, credentialId) VALUES (?, ?, ?, ?, ?, ?)`, 
                    [resumeId, name, issuingOrgs[index], issueDates[index], certificationLinks[index], credentialIds[index]], function(err) {
                    if (err) {
                        console.error('Error inserting certification:', err.message);
                    }
                });
            });
        }

        // Insert languages details
        if (req.body.languageName) {
            const languageNames = Array.isArray(req.body.languageName) ? req.body.languageName : [req.body.languageName];
            const proficiencyLevels = Array.isArray(req.body.proficiencyLevel) ? req.body.proficiencyLevel : [req.body.proficiencyLevel];
            languageNames.forEach((name, index) => {
                db.run(`INSERT INTO languages (resumeId, languageName, proficiencyLevel) VALUES (?, ?, ?)`, 
                    [resumeId, name, proficiencyLevels[index]], function(err) {
                    if (err) {
                        console.error('Error inserting language:', err.message);
                    }
                });
            });
        }

        // Insert accomplishments details
        if (req.body.accomplishmentName) {
            const accomplishmentNames = Array.isArray(req.body.accomplishmentName) ? req.body.accomplishmentName : [req.body.accomplishmentName];
            const accomplishmentOrgs = Array.isArray(req.body.accomplishmentOrg) ? req.body.accomplishmentOrg : [req.body.accomplishmentOrg];
            accomplishmentNames.forEach((name, index) => {
                db.run(`INSERT INTO accomplishments (resumeId, accomplishmentName, accomplishmentOrg) VALUES (?, ?, ?)`, 
                    [resumeId, name, accomplishmentOrgs[index]], function(err) {
                    if (err) {
                        console.error('Error inserting accomplishment:', err.message);
                    }
                });
            });
        }

        // Insert affiliations details
        if (req.body.membershipType) {
            const membershipTypes = Array.isArray(req.body.membershipType) ? req.body.membershipType : [req.body.membershipType];
            const affiliationOrgs = Array.isArray(req.body.affiliationOrg) ? req.body.affiliationOrg : [req.body.affiliationOrg];
            membershipTypes.forEach((type, index) => {
                db.run(`INSERT INTO affiliations (resumeId, membershipType, affiliationOrg) VALUES (?, ?, ?)`, 
                    [resumeId, type, affiliationOrgs[index]], function(err) {
                    if (err) {
                        console.error('Error inserting affiliation:', err.message);
                    }
                });
            });
        }

        // Insert additional info details
        if (req.body.hobbies || req.body.additionalInfo) {
            const hobbies = Array.isArray(req.body.hobbies) ? req.body.hobbies : [req.body.hobbies];
            const additionalInfos = Array.isArray(req.body.additionalInfo) ? req.body.additionalInfo : [req.body.additionalInfo];
            hobbies.forEach((hobby, index) => {
                db.run(`INSERT INTO additional_info (resumeId, hobbies, additionalInfo) VALUES (?, ?, ?)`, 
                    [resumeId, hobby, additionalInfos[index]], function(err) {
                    if (err) {
                        console.error('Error inserting additional info:', err.message);
                    }
                });
            });
        }

        res.json({ success: true, resumeId });
    });
});

// Endpoint to preview resume
app.get('/preview-resume', (req, res) => {
    const { resumeId, template } = req.query;

    // Fetch resume details from the database
    db.get(`SELECT * FROM resume WHERE id = ?`, [resumeId], (err, resume) => {
        if (err) {
            console.error('Error fetching resume:', err.message);
            return res.status(500).send('Error fetching resume.');
        }

        if (resume) {
            console.log('Resume fetched:', resume);

            // Fetch related details from the database
            const queries = [
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM education WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM experience WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM websites WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM certifications WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM languages WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM accomplishments WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM affiliations WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM additional_info WHERE resumeId = ?`, [resumeId], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                })
            ];

            Promise.all(queries)
                .then(results => {
                    const [education, experience, websites, certifications, languages, accomplishments, affiliations, additionalInfo] = results;

                    console.log('Education:', education);
                    console.log('Experience:', experience);
                    console.log('Websites:', websites);
                    console.log('Certifications:', certifications);
                    console.log('Languages:', languages);
                    console.log('Accomplishments:', accomplishments);
                    console.log('Affiliations:', affiliations);
                    console.log('Additional Info:', additionalInfo);

                    // Parse job descriptions - updated parsing logic
                    let jobDescriptions = [];
                    try {
                        // Remove outer quotes and unescape the string
                        const cleanedString = resume.job_descriptions
                            .replace(/^"+|"+$/g, '') // Remove outer quotes
                            .replace(/\\"/g, '"')     // Fix escaped quotes
                            .replace(/\\\\/g, '\\');  // Fix escaped backslashes
                        
                        // Parse the cleaned JSON string
                        jobDescriptions = JSON.parse(cleanedString);
                        
                        // Associate job descriptions with experience
                        experience.forEach((exp, index) => {
                            // Use the HTML content directly since it's already formatted
                            exp.responsibilities = jobDescriptions[index] || '';
                        });
                    
                        console.log('Parsed job descriptions:', jobDescriptions);
                    } catch (parseError) {
                        console.error('Error parsing job descriptions:', parseError.message, resume.job_descriptions);
                        jobDescriptions = [];
                    }
                    
                    // Fetch user details
                    const userId = resume.userId;
                    db.get(`SELECT * FROM user_details WHERE userId = ?`, [userId], (err, user) => {
                        if (err) {
                            console.error('Error fetching user details:', err.message);
                            return res.status(500).send('Error fetching user details.');
                        }

                        console.log('User details fetched:', user);

                        // Ensure correct path for profilePicture and fallback to default if missing
                        const profilePicture = user.profilePicture && user.profilePicture !== 'null' 
                            ? `${user.profilePicture}` 
                            : 'assets/default.jpg';

                        // Render the selected template with the fetched data
                        const templatePath = path.join(__dirname, 'templates', `${template}.html`);
                        ejs.renderFile(templatePath, { resume, education, experience, websites, certifications, languages, accomplishments, affiliations, additionalInfo, profilePicture, skills: resume.skills.split(',') }, (err, html) => {
                            if (err) {
                                console.error('Error rendering template:', err.message);
                                return res.status(500).send('Error rendering template.');
                            }

                            // Send the rendered HTML as the response
                            res.send(html);
                        });
                    });
                })
                .catch(err => {
                    console.error('Error fetching related details:', err.message);
                    res.status(500).send('Error fetching related details.');
                });
        } else {
            res.status(404).json({ success: false, message: 'Resume not found.' });
        }
    });
});

// Endpoint to get the latest resume by userId
app.get('/resume/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT * FROM resume WHERE userId = ? ORDER BY id DESC LIMIT 1`;
    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('Error fetching resume:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch resume.' });
        }

        if (row) {
            // Fetch related details from the database
            const queries = [
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM education WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM experience WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM websites WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM certifications WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM languages WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM accomplishments WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM affiliations WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }),
                new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM additional_info WHERE resumeId = ?`, [row.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                })
            ];

            Promise.all(queries)
                .then(results => {
                    const [education, experience, websites, certifications, languages, accomplishments, affiliations, additionalInfo] = results;
                    res.json({
                        success: true,
                        resume: row,
                        education,
                        experience,
                        websites,
                        certifications,
                        languages,
                        accomplishments,
                        affiliations,
                        additionalInfo
                    });
                })
                .catch(err => {
                    console.error('Error fetching related details:', err.message);
                    res.status(500).send('Error fetching related details.');
                });
        } else {
            res.status(404).json({ success: false, message: 'Resume not found.' });
        }
    });
});

// Endpoint to get experience by resumeId
app.get('/experience/:resumeId', (req, res) => {
    const resumeId = req.params.resumeId;

    const query = `SELECT * FROM experience WHERE resumeId = ?`;
    db.all(query, [resumeId], (err, rows) => {
        if (err) {
            console.error('Error fetching experience:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch experience.' });
        }

        if (rows.length > 0) {
            res.json({ success: true, experience: rows });
        } else {
            res.status(404).json({ success: false, message: 'Experience not found.' });
        }
    });
});

// Endpoint to get education by resumeId
app.get('/education/:resumeId', (req, res) => {
    const resumeId = req.params.resumeId;

    const query = `SELECT * FROM education WHERE resumeId = ?`;
    db.all(query, [resumeId], (err, rows) => {
        if (err) {
            console.error('Error fetching education:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch education.' });
        }

        if (rows.length > 0) {
            res.json({ success: true, education: rows });
        } else {
            res.status(404).json({ success: false, message: 'Education not found.' });
        }
    });
});

// Route to handle the suggestion of skills
app.post('/suggest-skills', async (req, res) => {
    const { userId, skills } = req.body;  // Destructure skills from request body

    // Validate the input
    if (!skills || skills.length === 0) {
        return res.status(400).json({ error: 'Skills are required' });
    }

    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('http://127.0.0.1:5000/suggest-skill', {  // Correct Flask route
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, skills }),  // Send both userId and skills
        });

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log("Data received from Python server:", data);  // Log response from Python server

            if (!response.ok) {
                throw new Error(`Error fetching suggested skills: ${data.error}`);
            }

            res.json(data);  // Send the response back to the client
        } else {
            // If response is not JSON, log the text response
            const text = await response.text();
            console.error('Non-JSON response from Python server:', text);
            res.status(500).json({ message: 'Received non-JSON response from Python server.' });
        }
    } catch (error) {
        console.error('Error suggesting skills:', error);
        res.status(500).json({ message: 'Error suggesting skills.' });
    }
});

// Create the table if it doesn't exist
db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS company_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT UNIQUE NOT NULL,
          image_url TEXT NOT NULL
      )
  `, (err) => {
      if (err) {
          console.error('Error creating table:', err.message);
      } else {
          console.log('Table created or already exists.');
      }
  });
});

//Create the salary_cache table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS salary_cache (
    job_title TEXT,
    location TEXT,
    salary TEXT,
    full_data TEXT,
    PRIMARY KEY (job_title, location)
  )`, (err) => {
    if (err) {
      console.error('Error creating salary_cache table:', err.message);
    } else {
      console.log('salary_cache table created or already exists.');
    }
  });
});

// Function to fetch salary details from the database or API
async function fetchSalaryDetails(jobTitle, location) {
  return new Promise((resolve, reject) => {
    db.get('SELECT salary, full_data FROM salary_cache WHERE job_title = ? AND location = ?', [jobTitle, location], async (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return reject('Database query error');
      }
      if (row) {
        console.log('Salary and full data taken from cache:', row.salary, row.full_data);
        return resolve({ average_salary: row.salary, full_data: JSON.parse(row.full_data) });
      } else {
        console.log('Fetching salary from API...');
        const apiUrl = `https://job-salary-data.p.rapidapi.com/job-salary?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}&radius=200`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'job-salary-data.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY
          }
        };

        try {
          const response = await fetch(apiUrl, options);
          const data = await response.json();
          console.log('API Response:', data); // Log the API response
          if (data.data && data.data.length > 0) {
            const medianSalaries = data.data.map(item => item.median_salary);
            const averageSalary = medianSalaries.reduce((acc, curr) => acc + curr, 0) / medianSalaries.length;

            // Save average salary and full data to database
            db.run('INSERT INTO salary_cache (job_title, location, salary, full_data) VALUES (?, ?, ?, ?)', [jobTitle, location, averageSalary, JSON.stringify(data)], (err) => {
              if (err) {
                console.error('Error inserting into database:', err.message);
              } else {
                console.log('Salary and full data cached.');
              }
            });
            console.log('Average salary fetched from API:', averageSalary);
            return resolve({ average_salary: averageSalary, full_data: data });
          } else {
            return resolve({ average_salary: 'Salary data not available', full_data: null }); // Fallback message
          }
        } catch (error) {
          console.error('Error fetching salary details:', error);
          return resolve({ average_salary: 'Error fetching salary details', full_data: null }); // Fallback message
        }
      }
    });
  });
}

// Function to fetch company image from the database or API
async function fetchCompanyImage(companyName) {
  return new Promise((resolve, reject) => {
      db.get('SELECT image_url FROM company_images WHERE company_name = ?', [companyName], async (err, row) => {
          if (err) {
              console.error('Error querying database:', err.message);
              return reject('Database query error');
          }
          if (row) {
              console.log('Image taken from cache:', row.image_url);
              return resolve(row.image_url);
          } else {
              console.log('Fetching image from API...');
              const apiKey = process.env.CUSTOM_SEARCH_API;
              const cx = process.env.GOOGLE_CSE_ID;
              const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${companyName}&cx=${cx}&key=${apiKey}&searchType=image`;

              try {
                  const response = await fetch(searchUrl);
                  const data = await response.json();
                  if (data.items && data.items.length > 0) {
                      const imageUrl = data.items[0].link;
                      // Save image to database
                      db.run('INSERT INTO company_images (company_name, image_url) VALUES (?, ?)', [companyName, imageUrl], (err) => {
                          if (err) {
                              console.error('Error inserting into database:', err.message);
                          }
                          else {
                            console.log('Image cached.')
                          }
                      });
                      console.log('Image fetched from API:', imageUrl);
                      return resolve(imageUrl);
                  } else {
                      return resolve('assets/default-company-image.jpg'); // Fallback image
                  }
              } catch (error) {
                  console.error('Error fetching company image:', error);
                  return resolve('assets/default-company-image.jpg'); // Fallback image
              }
          }
      });
  });
}

// Endpoint to get company image
app.get('/company/:name/image', async (req, res) => {
  const companyName = req.params.name;
  try {
      const imageUrl = await fetchCompanyImage(companyName);
      res.json({ imageUrl });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Endpoint to get salary details
app.get('/salary', async (req, res) => {
  const jobTitle = req.query.job_title;
  const location = req.query.location;

  try {
    const result = await fetchSalaryDetails(jobTitle, location);
    res.json({ average_salary: result.average_salary, full_data: result.full_data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salary details' });
  }
});

// Create the application_links table if it doesn't exist
db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS application_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_title TEXT NOT NULL,
          company_name TEXT NOT NULL,
          location TEXT NOT NULL,
          link TEXT NOT NULL,
          UNIQUE(job_title, company_name, location)
      )
  `, (err) => {
      if (err) {
          console.error('Error creating application_links table:', err.message);
      } else {
          console.log('application_links table created or already exists.');
      }
  });
});

// Endpoint to fetch and cache application links
app.get('/job-application-link', async (req, res) => {
  const { jobTitle, companyName, location } = req.query;

  // Check if the link is cached
  db.get(`SELECT link FROM application_links WHERE job_title = ? AND company_name = ? AND location = ?`, 
      [jobTitle, companyName, location], async (err, row) => {
          if (err) {
              console.error('Error querying database:', err.message);
              return res.status(500).json({ error: 'Internal Server Error' });
          }

          if (row) {
              console.log('Link found in cache:', row.link);
              return res.json({ link: row.link });
          } else {
              console.log('Link not found in cache. Fetching from Google Search API...');
              const apiKey = process.env.CLOUD_API_KEY;
              const cx = process.env.GOOGLE_CSE_ID;
              const searchUrl = `https://www.googleapis.com/customsearch/v1?q=apply+for+${encodeURIComponent(jobTitle)}+at+${encodeURIComponent(companyName)}+in+${encodeURIComponent(location)}&cx=${cx}&key=${apiKey}`;

              try {
                  const response = await fetch(searchUrl);
                  const data = await response.json();
                  if (data.items && data.items.length > 0) {
                      const link = data.items[0].link;
                      console.log('Fetched link from Google Search API:', link);

                      // Save to the database
                      db.run(`INSERT INTO application_links (job_title, company_name, location, link) VALUES (?, ?, ?, ?)`,
                          [jobTitle, companyName, location, link], function(err) {
                              if (err) {
                                  console.error('Error saving application link to database:', err.message);
                              } else {
                                  console.log('Application link cached in database:', link);
                              }
                          });
                      return res.json({ link });
                  } else {
                      const fallbackLink = 'https://www.google.com/search?q=' + encodeURIComponent(`${jobTitle} ${companyName} ${location} apply`);
                      console.log('No results found. Using fallback link:', fallbackLink);
                      return res.json({ link: fallbackLink });
                  }
              } catch (error) {
                  console.error('Error fetching job application link:', error);
                  const fallbackLink = 'https://www.google.com/search?q=' + encodeURIComponent(`${jobTitle} ${companyName} ${location} apply`);
                  console.log('Using fallback link due to error:', fallbackLink);
                  return res.json({ link: fallbackLink });
              }
          }
      });
});

// Create the saved_jobs table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      job_id INTEGER,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id)
  )`, (err) => {
      if (err) {
          console.error('Error creating saved_jobs table:', err.message);
      } else {
          console.log('saved_jobs table created or already exists.');
      }
  });
});

app.post('/save-job', (req, res) => {
  const { jobId, userId } = req.body;

  const query = `INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)`;

  db.run(query, [userId, jobId], function (err) {
      if (err) {
          console.error('Error saving job:', err.message);
          res.status(500).json({ success: false, message: 'Failed to save job.' });
      } else {
          res.json({ success: true, message: 'Job saved successfully.' });
      }
  });
});

app.post('/unsave-job', (req, res) => {
  const { jobId, userId } = req.body;

  if (!jobId || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid parameters' });
  }

  const query = `DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?`;

  db.run(query, [userId, jobId], function (err) {
      if (err) {
          console.error('Error unsaving job:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to unsave job.' });
      }
      
      if (this.changes === 0) {
          return res.json({ success: false, message: 'Job not found in saved jobs.' });
      }

      res.json({ success: true, message: 'Job unsaved successfully.' });
  });
});

app.get('/saved/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT job_id FROM saved_jobs WHERE user_id = ?`;
  db.all(query, [userId], (err, rows) => {
      if (err) {
          console.error('Error retrieving saved jobs:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve saved jobs.' });
      }
      res.json({ success: true, jobs: rows });
  });
});


// API route to fetch saved jobs by user ID
app.get('/saved-jobs/:userId', async (req, res) => {
  const { userId } = req.params;
  const savedJobs = [];

  // Connect to the database
  const db = getDbConnection();

  // Query to get job IDs for the given user ID
  db.all('SELECT job_id FROM saved_jobs WHERE user_id = ?', [userId], async (err, rows) => {
      if (err) {
          console.error('Error fetching saved jobs:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to fetch saved jobs.' });
      }

      // Filter out null job IDs
      const jobIds = rows.map(row => row.job_id).filter(id => id !== null);

      // If no job IDs found, return an empty list
      if (jobIds.length === 0) {
          return res.json({ success: true, jobs: [] });
      }

      // Call the Python API to get job details
      try {
          const response = await fetch(`http://127.0.0.1:5000/saved-jobs/${userId}`);
          if (!response.ok) {
              throw new Error('Failed to fetch from Python API');
          }
          const data = await response.json();
          res.json(data);
      } catch (error) {
          console.error('Error calling Python API:', error.message);
          res.status(500).json({ success: false, message: 'Error retrieving job details.' });
      }
  });
});


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS job_descriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_title TEXT UNIQUE,
      description TEXT
  )`);
});

// Endpoint to generate job descriptions with caching
app.get('/generate-job-description', async (req, res) => {
  const jobTitle = req.query.jobTitle;

  // Check if the job description is already cached in the database
  db.get('SELECT description FROM job_descriptions WHERE job_title = ?', [jobTitle], async (err, row) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (row) {
          // Return the cached job description
          console.log('Returning cached job description for:', jobTitle);
          return res.json({ success: true, description: row.description });
      }

      try {
          // If not cached, fetch from the API
          const response = await fetch(`http://127.0.0.1:5000/generate-job-description?jobTitle=${encodeURIComponent(jobTitle)}`);
          const data = await response.json();

          if (data.success) {
              // Cache the job description in the database
              db.run('INSERT INTO job_descriptions (job_title, description) VALUES (?, ?)', [jobTitle, data.description], (err) => {
                  if (err) {
                      console.error('Failed to cache job description:', err);
                      return res.status(500).json({ success: false, message: 'Failed to cache job description' });
                  }

                  // Return the job description
                  res.json({ success: true, description: data.description });
              });
          } else {
              res.json({ success: false, message: data.message });
          }
      } catch (error) {
          console.error('Error generating job description:', error);
          res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
  });
});

// Create the user_summaries table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_title TEXT NOT NULL,
      experience TEXT NOT NULL,
      skills TEXT NOT NULL,
      summary TEXT NOT NULL,
      UNIQUE (job_title, experience, skills) -- Ensures uniqueness for job_title and skills combination
    );
  `);
});

// Endpoint to generate user summary with caching
app.get('/generate-summary', async (req, res) => {
  const jobTitle = req.query.jobTitle;
  const skills = req.query.skills;
  const experience = req.query.experience;

  // Check if both jobTitle and skills are provided
  if (!jobTitle || !skills) {
      return res.status(400).json({ success: true, message: 'Job title, experience and skills not provided, proceeding with default summary.' });
  }

  // Check if the user summary is already cached in the database
  db.get('SELECT summary FROM user_summaries WHERE job_title = ? AND experience = ? AND skills = ?', [jobTitle, experience, skills], async (err, row) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (row) {
          // Return the cached user summary
          console.log('Returning cached user summary for:', experience, jobTitle, 'with skills:', skills);
          return res.json({ success: true, summary: row.summary });
      }

      try {
          // If not cached, fetch from the AI API
          const response = await fetch(`http://127.0.0.1:5000/generate-summary?jobTitle=${encodeURIComponent(jobTitle)}&skills=${encodeURIComponent(skills)}&experience=${encodeURIComponent(experience)}`);
          const data = await response.json();

          if (data.success) {
// Cache the user summary in the database
db.run('INSERT INTO user_summaries (job_title, experience, skills, summary) VALUES (?, ?, ?,  ?)', [jobTitle, experience, skills, data.summary], (err) => {

  if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
          // If the summary already exists, you can choose to update it or ignore
          console.warn('Summary already exists for this job title and skills. Skipping cache.');
          return res.json({ success: true, summary: data.summary }); // Just return the generated summary
      }
      console.error('Failed to cache user summary:', err);
      return res.status(500).json({ success: false, message: 'Failed to cache user summary' });
  }

  // Return the generated user summary
  res.json({ success: true, summary: data.summary });
});
          } else {
              res.json({ success: false, message: data.message });
          }
      } catch (error) {
          console.error('Error generating user summary:', error);
          res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
  });
});

// Add this route to fetch chat history
app.get('/get-chat-history/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      const response = await fetch(`http://127.0.0.1:5000/get-chat-history/${userId}`);
      const data = await response.json();

      if (response.ok) {
          res.json({ success: true, history: data.history });
      } else {
          res.status(response.status).json({ success: false, message: data.error });
      }
  } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Route to clear chat history
app.delete('/clear-chat-history/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(`http://127.0.0.1:5000/clear-chat-history/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, message: 'Chat history cleared' });
    } else {
      const errorText = await response.text();
      console.error('Error response from Flask:', errorText);
      res.status(response.status).json({ success: false, message: errorText });
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/status', (req, res) => {
  res.status(200).send('OK');
});

// Middleware to check if route exists
app.use((req, res, next) => {
  res.status(404).redirect('/404');
});

// Function to log unused files
async function deleteUnusedFiles() {
  const directories = ['uploads', 'profile_uploads'];
  const tables = [
    { table: 'handwritten_ai', column: 'image' },
    { table: 'image_history', column: 'originalImagePath' },
    { table: 'image_history', column: 'processedImagePath' },
    { table: 'user_details', column: 'profilePicture' }
  ];

  const db = new sqlite3.Database('database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  for (const dir of directories) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      let fileInUse = false;

      for (const { table, column } of tables) {
        const query = `SELECT ${column} FROM ${table}`;
        const rows = await new Promise((resolve, reject) => {
          db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        for (const row of rows) {
          const dbFileName = path.basename(row[column]).replace(/\\/g, '/'); // Normalize and get filename
          const fileName = path.basename(file).replace(/\\/g, '/'); // Normalize and get filename
          if (dbFileName === fileName) {
            fileInUse = true;
            break;
          }
        }

        if (fileInUse) break;
      }

      if (!fileInUse) {
        const filePath = path.join(dir, file);
        await unlinkAsync(filePath);
        console.log(`Deleted unused file: ${filePath}`);
      }
    }
  }

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

// Call the delete function when the server starts
deleteUnusedFiles().catch(err => console.error('Error during deletion:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
