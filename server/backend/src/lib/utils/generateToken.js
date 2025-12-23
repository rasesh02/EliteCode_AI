import jwt from "jsonwebtoken"

// Option C: generate a JWT and return it to the controller.
// The controller will send it back in the JSON response body.
export const generateTokenAndSetCookie = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRETKEY, {
        expiresIn: "15d",
    });
    return token;
}
