require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//HubSpot API token from .env
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_API_KEY;

const CUSTOM_OBJECT_API_NAME = "pets";

/**
 *Homepage route - shows all records of your custom object
 */
app.get("/", async (req, res) => {
  try {
    const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_API_NAME}?limit=100&properties=pet_name,animal_type,pet_breed`;

    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    };

    const response = await axios.get(url, { headers });
    const records = response.data.results || [];

    res.render("homepage", {
      pageTitle: "Homepage | Custom Object List",
      records,
    });
  } catch (error) {
    console.error(
      "Error fetching custom objects:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to fetch custom objects.");
  }
});

/**
 * Render the form to add a new custom object record
 */
app.get("/update-cobj", (req, res) => {
  res.render("updates", {
    pageTitle:
      "Update Custom Object Form | Integrating With HubSpot I Practicum",
  });
});

/**
 * Handle form submission to create a new custom object record
 */
app.post("/update-cobj", async (req, res) => {
  try {
    const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_API_NAME}`;
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
      "Content-Type": "application/json",
    };

    const properties = {
      pet_name: req.body.pet_name,
      animal_type: req.body.animal_type,
      pet_breed: req.body.pet_breed,
    };

    await axios.post(url, { properties }, { headers });

    res.redirect("/");
  } catch (error) {
    console.error(
      "Error creating custom object:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to create custom object.");
  }
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
