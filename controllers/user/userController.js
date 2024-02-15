const pool = require("../../db");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key';
const bcrypt = require('bcrypt');
const { UserModel } = require("../../models/user/userModel");
const saltRounds = 10; // Number of salt rounds to use


  //login
  const login = async (req, res) => {
  //console.log(req.body);
    try {
      const { name, password } = req.body;
      //console.log(req.body);
      // TODO: Validate email and password inputs
      const hashedPassword = await hashPassword(password);
      // Assuming you have a users table with columns 'email' and 'password'
      const query = `
        SELECT * FROM people
        WHERE name = $1 AND password = $2;
      `;
      const values = [name, hashedPassword];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 1) {
        // User found, login successful
        const token = jwt.sign({ name }, SECRET_KEY);
        const userModel = new UserModel(result.rows[0]);
        res.status(200).json({ message: "Login successful", user: userModel, token: token, loginType: "email" });
      } else {
        // User not found or invalid credentials
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  // Get all blog entries
  const signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      //console.log(req.body);
  
      // TODO: Validate email and password inputs
  
      // Check if the user with the given email already exists
      const checkUserQuery = `
        SELECT * FROM people
        WHERE name = $1;
      `;
      
      const checkUserValues = [name];
  
      const existingUser = await pool.query(checkUserQuery, checkUserValues);
  
      if (existingUser.rows.length > 0) {
        // User with the provided email already exists
        return res.status(409).json({ error: "User already exists" });
      }

      // Check if the user with the given email already exists
      const checkEmailQuery = `
        SELECT * FROM people
        WHERE email = $1;
      `;

      const checkEmailValues = [email];

      const existingEmail = await pool.query(checkEmailQuery, checkEmailValues);

      if (existingEmail.rows.length > 0) {
        // User with the provided email already exists
        return res.status(409).json({ error: "Email already exists" });
      }
  
      // Assuming you have a 'users' table with columns 'email' and 'password'
      const signUpQuery = `
        INSERT INTO people (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      // Hash and salt the password before storing it in the database
      const hashedPassword = await hashPassword(password);
  
      const signUpValues = [name, email, hashedPassword];
  
      const newUser = await pool.query(signUpQuery, signUpValues);
  
      const token = jwt.sign({ name }, SECRET_KEY);
      const userModel = new UserModel(newUser.rows[0]);
      res.status(201).json({ message: "Signup successful", user: userModel, token: token, loginType: "email" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

// Get all blog entries
const signupGoogle = async (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Validate email and password inputs

    // Check if the user with the given email already exists
    const checkUserQuery = `
      SELECT * FROM people
      WHERE email = $1;
    `;
    const checkUserValues = [email];

    try {
      const existingUser = await pool.query(checkUserQuery, checkUserValues);
      if (existingUser.rows.length > 0) {
        // User with the provided email already exists
        const token = jwt.sign({ email }, SECRET_KEY);
        const userModel = new UserModel(existingUser.rows[0]);
        return res.status(200).json({ message: "login successful", user: userModel, token: token, loginType: "google" });
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }

    // Assuming you have a 'users' table with columns 'name', 'email', and 'password'
    const signUpQuery = `
      INSERT INTO people (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    // Assuming you want to insert an empty string for the 'name' and 'password' fields
    const signUpValues = ['', email, ''];

    try {
      const newUser = await pool.query(signUpQuery, signUpValues);
      const token = jwt.sign({ email }, SECRET_KEY);
      res.status(201).json({ message: "Signup successful", user: newUser.rows[0], token: token, loginType: "google" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  } catch (error) {
    console.error("Error in signupGoogle:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      email,
      image,
      phoneNo,
      postalCode,
      address,
      addressLongitude,
      addressLatitude,
    } = req.body;
    console.log(req.body);

    const checkUserQuery = `
      SELECT * FROM people
      WHERE name = $1 AND id != $2;`;
    
    const checkUserValues = [name, id];
  
    const existingUser = await pool.query(checkUserQuery, checkUserValues);
  
    if (existingUser.rows.length > 0) {
        // User with the provided email already exists
      return res.status(409).json({ error: "User already exists" });
    }

    // Check if the user with the given email already exists
    const checkEmailQuery = `
      SELECT * FROM people
      WHERE email = $1 AND id != $2;`;

    const checkEmailValues = [email, id];

    const existingEmail = await pool.query(checkEmailQuery, checkEmailValues);

    if (existingEmail.rows.length > 0) {
      // User with the provided email already exists
      return res.status(409).json({ error: "Email already exists" });
    }

    const query = `
      UPDATE people
      SET
        name = $1,
        email = $2,
        image = $3,
        phone_no= $4,
        postal_code = $5,
        address=$6,
        address_longitude = $7,
        address_latitude = $8
      WHERE id = $9
      RETURNING *;
    `;
    //const query = ``

    const values = [
      name,
      email,
      image,
      phoneNo,
      postalCode,
      address,
      addressLongitude,
      addressLatitude,
      id,
    ];
    //console.log(values);

    const result = await pool.query(query, values);
    const userModel = new UserModel(result.rows[0]);
    res.status(201).json(userModel);
    //res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
  //Function to hash the password (you need to implement this based on your chosen library)
  const hashPassword = async (password) => {
    return password;
    // try {
    //   const salt = await bcrypt.genSalt(saltRounds);
    //   const hashedPassword = await bcrypt.hash(password, salt);
    //   return hashedPassword;
    // } catch (error) {
    //   throw error;
    // }
  };
  

module.exports = {
  login,
  signup,
  signupGoogle,
  updateProfile,
};


// const { User } = require('../../models/user/userModel'); 
// const bcrypt = require('bcrypt');

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log(req.body);

//     // TODO: Validate email and password inputs

//     const user = await User.findOne({
//       where: {
//         email,
//       },
//     });
    
//     if (user && bcrypt.compareSync(password, user.password)) {
//       res.status(200).json({ message: 'Login successful' });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const signup = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // TODO: Validate email and password inputs

//     const existingUser = await User.findOne({
//       where: {
//         email,
//       },
//     });

//     if (existingUser) {
//       return res.status(409).json({ error: 'User already exists' });
//     }

//     const hashedPassword = bcrypt.hashSync(password, 10);

//     const newUser = await User.create({
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: 'Signup successful', user: newUser });
//   } catch (error) {
//     console.error('Error during signup:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const signupGoogle = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // TODO: Validate email and password inputs

//     const existingUser = await User.findOne({
//       where: {
//         email,
//       },
//     });

//     if (existingUser) {
//       return res.status(409).json({ message: 'Login successful' });
//     }

//     const newUser = await User.create({
//       email,
//     });

//     res.status(201).json({ message: 'Signup successful', user: newUser });
//   } catch (error) {
//     console.error('Error during signup:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };