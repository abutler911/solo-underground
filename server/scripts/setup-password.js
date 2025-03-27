// server/scripts/setup-password.js
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Path to .env file
const envPath = path.join(__dirname, "..", ".env");

// Function to generate a random secure password
const generateSecurePassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }

  return password;
};

// Check if .env file exists and read its contents
let envContents = "";
if (fs.existsSync(envPath)) {
  envContents = fs.readFileSync(envPath, "utf8");
}

console.log("\n=== Solo Underground Site Password Setup ===\n");
console.log("This script will help you set up a password for your site.");
console.log("Anyone with this password will be able to access your content.\n");

rl.question(
  "Would you like to (1) enter your own password or (2) generate a random secure one? [1/2]: ",
  (answer) => {
    const choice = answer.trim();

    if (choice === "1") {
      rl.question("\nEnter your desired site password: ", (password) => {
        if (password.length < 8) {
          console.log(
            "\nWarning: Short passwords are less secure. Consider using a longer password."
          );
        }

        updateEnvFile(password);
      });
    } else if (choice === "2") {
      const password = generateSecurePassword(16);
      console.log(`\nGenerated password: ${password}`);
      console.log("\nMake sure to save this password somewhere secure!");

      updateEnvFile(password);
    } else {
      console.log(
        "\nInvalid choice. Please run the script again and select 1 or 2."
      );
      rl.close();
    }
  }
);

function updateEnvFile(password) {
  // Check if SITE_PASSWORD already exists in .env
  const sitePasswordRegex = /SITE_PASSWORD=.*/;

  if (sitePasswordRegex.test(envContents)) {
    // Replace existing SITE_PASSWORD
    envContents = envContents.replace(
      sitePasswordRegex,
      `SITE_PASSWORD=${password}`
    );
  } else {
    // Add SITE_PASSWORD
    envContents += `\nSITE_PASSWORD=${password}`;
  }

  // Write to .env file
  fs.writeFileSync(envPath, envContents);

  console.log("\nSITE_PASSWORD has been added to your .env file.");
  console.log(
    "\nYour site is now password-protected! Share this password only with people you want to grant access to your content.\n"
  );

  rl.close();
}
