



const signup = require("../controller/admin/authentication/signup")
const login = require("../controller/admin/authentication/login")
const profile = require("../controller/admin/profile/dashboard")

function adminRouter(app) {

app.use("/api/admin/signup", signup)
app.use("/api/admin/login", login)

app.use("/api/admin/profile", profile)



}

module.exports = adminRouter