const express = require("express")
const router = express()

router.use("/api/users", require("./UserRoutes.js"))
router.use("/api/photos", require("./PhotoRoutes.js"))

// test route
router.get("/", (req, rese) => {
    rese.send("Api Working")
})

module.exports = router