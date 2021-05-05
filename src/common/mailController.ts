import * as nodemailer from "nodemailer";
import { environment } from "../config/environment";
import { readFileSync, readFile } from 'fs';
import { strict } from "assert";
import { User } from "../data/models/User";

export class MailController{
    
     loadHtml(user:User){
        let data = readFileSync('./src/common/pwd.html')
        console.log(environment.server_url + "/recoverPassword?token="+ String(user.tokenPwdRecover));
        const result = String(data).replace("USER_NAME_HASH", (<string>user.nome)).replace("HREF_HASH", environment.server_url + "/recoverPassword?token="+ String(user.tokenPwdRecover));
        return result
    }
    async sendMail(user:User) {

        let mailOptions = environment.mailOptions
        mailOptions.to = String(user.email)
        mailOptions.html = this.loadHtml(user)
        const transporter = await nodemailer.createTransport(environment.smtpServer);
        return transporter.sendMail(mailOptions).then((error) => {
            if (error) {
                return error;
            } else {
                return "E-mail enviado com sucesso!";
            }
        }) 
    }

}
