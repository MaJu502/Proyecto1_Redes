/* Con la ayuda de la pagina oficial de conn client en 
   npm io se sabe algunos de los comandos y la forma de
   escribir las funciones que se necesitan para el manejo
   del cliente.
   https://npm.io/package/@conn/client
*/

const { client } = require("@xmpp/client");

class xmClient {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.server = 'alumchat.xyz';
        this.conn = null;
        console.log("CREATEDDDDDDDDD!");
    }

    async signup() {
        this.conn = client({
            service: `xmpp://${this.server}:5222`,
            domain: this.server,
            tls: {
                rejectUnauthorized: false,
            },
        });

        this.conn.on("error", (err) => {
            console.error(" >> ERROR: error happened during signup:", err);
        });

        this.conn.on("online", async (jid) => {
            console.log("Connected for signup! JID:", jid.toString());

            // Envía una solicitud de registro utilizando el mecanismo "PLAIN"
            await this.conn.send(
                xml(
                    "iq",
                    { type: "set", id: "reg1" },
                    xml("query", { xmlns: "jabber:iq:register" }),
                    xml("username", {}, this.username),
                    xml("password", {}, this.password)
                )
            );
        });

        try {
            await this.conn.start();
        } catch (error) {
            console.error(" >> ERROR: error happened during signup:", error);
        }
    }

    async login() {
        this.conn = client({
            service: "xmpp://alumchat.xyz:5222",
            domain: "alumchat.xyz",
            username: this.username,
            password: this.password,
            tls: {
                rejectUnauthorized: true,
            }
        });
    
        this.conn.on("online", (jid) => {
            console.log(" >> Login successful! JID:", jid.toString());
            // Aquí puedes realizar acciones después de un inicio de sesión exitoso
        });
    
        this.conn.on("error", (err) => {
            console.error(" >> ERROR: error happened during login:", err);
        });
    
        try {
            await this.conn.start();
        } catch (error) {
            console.error(" >> ERROR: error happened during login:", error);
        }
    }
    

    async logout() {
        try {
            // Espera a que se detenga la conexión
            await this.conn.stop();
            console.log(" >> Logout successful!")
        } catch (error) {
            console.error(" >> ERROR: error happened during logout:", error);
        }
    }
    
}

module.exports = {
    xmClient
};
