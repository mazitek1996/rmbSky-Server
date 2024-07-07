



const signup = require("../controller/admin/authentication/signup")
const login = require("../controller/admin/authentication/login")

function adminRouter(app) {

app.use("/api/admin/signup", signup)
app.use("/api/admin/login", login)



}

module.exports = adminRouter