const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* =========================================================
   CONFIGURATION
   ========================================================= */

const DATA_DIRECTORY = path.join(__dirname, "../data");
const TOKEN_FILE = path.join(DATA_DIRECTORY, "oauth-tokens.enc");

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

/* =========================================================
   VALIDATE ENCRYPTION KEY
   ========================================================= */

const getEncryptionKey = () => {
    if (!ENCRYPTION_KEY) {
        throw new Error("TOKEN_ENCRYPTION_KEY is missing.");
    }

    if (!/^[a-fA-F0-9]{64}$/.test(ENCRYPTION_KEY)) {
        throw new Error(
            "TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal string."
        );
    }

    return Buffer.from(ENCRYPTION_KEY, "hex");
};

/* =========================================================
   ENSURE DATA DIRECTORY
   ========================================================= */

const ensureDataDirectory = () => {
    if (!fs.existsSync(DATA_DIRECTORY)) {
        fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
    }
};

/* =========================================================
   ENCRYPT DATA
   AES-256-GCM
   ========================================================= */

const encryptData = (data) => {
    const key = getEncryptionKey();

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        key,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(data), "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
        encryptedData: encrypted.toString("hex"),
    };
};

/* =========================================================
   DECRYPT DATA
   ========================================================= */

const decryptData = (encryptedObject) => {
    const key = getEncryptionKey();

    const iv = Buffer.from(encryptedObject.iv, "hex");
    const authTag = Buffer.from(encryptedObject.authTag, "hex");
    const encryptedData = Buffer.from(
        encryptedObject.encryptedData,
        "hex"
    );

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
};

/* =========================================================
   SAVE TOKENS
   ========================================================= */

const saveTokens = (tokens) => {
    ensureDataDirectory();

    const encryptedObject = encryptData(tokens);

    fs.writeFileSync(
        TOKEN_FILE,
        JSON.stringify(encryptedObject, null, 2),
        "utf8"
    );
};

/* =========================================================
   LOAD TOKENS
   ========================================================= */

const loadTokens = () => {
    if (!fs.existsSync(TOKEN_FILE)) {
        return null;
    }

    const fileContent = fs.readFileSync(TOKEN_FILE, "utf8");

    const encryptedObject = JSON.parse(fileContent);

    return decryptData(encryptedObject);
};

/* =========================================================
   DELETE TOKENS
   ========================================================= */

const deleteTokens = () => {
    if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
    }
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
    saveTokens,
    loadTokens,
    deleteTokens,
};