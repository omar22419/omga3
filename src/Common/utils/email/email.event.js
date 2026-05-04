import { EventEmitter } from "node:events";
import { emailTemplate } from "./template.email.js";
import { sendEmail } from "./send.email.js";

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

emailEmitter.on("Reset Password", async ({to, subject="Verify your email", code, title = "Confirm_email"}={}) => {
    try{
        await sendEmail({
            to, subject, html:emailTemplate({title, code})
        })
    }catch(error){
        console.log(error)
    }
})

emailEmitter.on("workspace-invite", async ({to, subject="workspace-invite", code, title = "workspace-invite"}={}) => {
    try{
        await sendEmail({
            to, subject, html:emailTemplate({title, code})
        })
    }catch(error){
        console.log(error)
    }
}) 