import { EventEmitter } from "node:events";
import { emailTemplate } from "./template.email.js";

export const emailEmitter = new EventEmitter();

emailEmitter.on("ConfirmEmail", async ({to, subject="Verify your email", code, title = "Confirm_email"}={}) => {
    try{
        await sendEmail({
            to, subject, html:emailTemplate({title, code})
        })
    }catch(error){
        console.log(error)
    }
}) 