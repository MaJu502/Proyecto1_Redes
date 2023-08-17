/* Con la ayuda de la pagina oficial de conn client en 
   npm io se sabe algunos de los comandos y la forma de
   escribir las funciones que se necesitan para el manejo
   del cliente.
   https://npm.io/package/@conn/client
*/

const { client, xml, jid } = require("@xmpp/client");
const fs = require("fs");

class xmClient {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.server = "alumchat.xyz";
        this.conn = null;
        this.errorLogPath = "error-log-xmpp.txt";
        this.initErrorLog();
        this.contacts = []; // Array para almacenar los contactos
        this.userJID;
    }

    initErrorLog() {
        fs.writeFileSync(this.errorLogPath, ""); // Limpia el archivo de registro de errores
    };

    logError(identifier, error) {
        const errorMsg = `Identifier: ${identifier}\nTimestamp: ${new Date().toISOString()}\nError: ${error}\n\n`;
        fs.appendFileSync(this.errorLogPath, errorMsg);
    };

    async signup() {
        this.conn = client({
            service: "xmpp://alumchat.xyz:5222",
            domain: "alumchat.xyz",
            username: "jur20308main",
            password: "pass123",
        
            tls: {
              rejectUnauthorized: true,
            }
        });
    
        this.conn.on("error", (err) => {
            const identifier = "signup";
            this.logError(identifier, err);
            console.error(" >> ERROR: error happened during connection (check error-log-xmpp.txt for info).");
        });
        
        try {
            this.conn.start();
        
            this.conn.on("online", () => {
              console.log("XMPP connection online");
        
              const stanza = xml(
                "iq", 
                { type: "set", id: "register1"},
                xml("query", { xmlns: "jabber:iq:register" },
                xml("username", {}, this.username),
                xml("password", {}, this.password),
                )
              );
            
                this.conn.send(stanza);
                console.log("Registration IQ sent successfully");
                
                this.conn.disconnect();
                console.log("Disconnected");
            });
            return 0;
        
        } catch (error) {
            const identifier = "signup";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during signup (check error-log-xmpp.txt for info).");
            return 1;
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
            console.log(" >> Login successful! JID:\n", jid.toString());
            this.userJID = jid.toString().split('/')[0];
        });
    
        this.conn.on("error", (err) => {
            const identifier = "login";
            this.logError(identifier, err);
        });
    
        try {
            await this.conn.start();
            return 0;
        } catch (error) {
            const identifier = "login";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during login: user might not exist (check error-log-xmpp.txt for info).");
            return 1;
        }
    }
    

    async logout() {
        try {
            // Espera a que se detenga la conexión
            await this.conn.stop();
            console.log(" >> Logout successful!")
            return 0;
        } catch (error) {
            const identifier = "logout";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during logout (check error-log-xmpp.txt for info).");
            return 1;
        }
    }

    async deleteAccount() {

        try {        
            
            const stanza = xml(
                "iq", 
                { type: "set", id: "delete-account"},
                xml("query", { xmlns: "jabber:iq:register" },
                xml("username", {}, this.username),
                xml("password", {}, this.password),
                xml("remove"),
            ));

            this.conn.send(stanza);
            console.log(" >> Account deleted succesfully! ")
        
        } catch (error) {
            const identifier = "deleteAccount";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during delete (check error-log-xmpp.txt for info).");
        }

    }

    async addContact(contactJID) {
        try {
            const subscribeStanza = xml(
                'presence',
                { from: this.userJID, to: contactJID, type: 'subscribe' }
            );

            this.conn.send(subscribeStanza);
            this.contacts.push(contactJID);

            console.log(` >> Sent contact subscription request to ${contactJID}`);
        } catch (error) {
            const identifier = 'sendContactSubscription';
            this.logError(identifier, error);
        }
    }


    async listenForIncomingSubscriptions() {
        try {
            this.conn.on('stanza', (stanza) => {
                if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
                    const contactJID = stanza.attrs.from;
                    console.log(` >> Incoming subscription request from: ${contactJID}`);
    
                    // Aceptar automáticamente las solicitudes de suscripción
                    const subscribedStanza = xml(
                        'presence',
                        { to: contactJID, type: 'subscribed' }
                    );
    
                    this.conn.send(subscribedStanza);
    
                    console.log(` >> Accepted subscription request from: ${contactJID}`);
                }
            });
        } catch (error) {
            const identifier = 'listenForIncomingSubscriptions';
            this.logError(identifier, error);
        }
    }

    async getContactList() {
        try {
            
            this.conn.on("online", async () => {
                console.log("Connected for getting contacts! JID:", jid.toString());
    
                const getContactsStanza = `<iq type='get' id='jh2gs675'>
                    <query xmlns='jabber:iq:roster'/>
                </iq>`;
    
                try {
                    const response = await this.conn.send(getContactsStanza);
                    console.log(" >> Contacts:", response.getChild("query").toString());
                } catch (error) {
                    const identifier = 'gettingContacts';
                    this.logError(identifier, error);
                }
    
                // Espera a que se detenga la conexión
                await this.conn.stop();
                console.log(" >> Getting contacts finished!");
            });

        } catch (error) {
            const identifier = 'getContactList';
            this.logError(identifier, error);
        }
    }

    async getContactInfo(contactJID) {
        try {
            const vcard = await this.conn.getVCard(contactJID);

            console.log(`Información del contacto: ${contactJID}`);
            console.log(`Nombre: ${vcard.name}`);
            console.log(`Apellido: ${vcard.family}`);
            console.log(`Correo electrónico: ${vcard.email}`);
            // Agrega más campos de vCard según tus necesidades

        } catch (error) {
            const identifier = 'getContactInfo';
            this.logError(identifier, error);
        }
    }

    async changeUserPresence(presenceType, statusMessage = '') {
        try {
            const presenceStanza = xml(
                'presence',
                { type: presenceType },
                xml('status', {}, statusMessage)
            );

            this.conn.send(presenceStanza);

            console.log(` >> Cambio de estado de usuario: ${presenceType}`);
        } catch (error) {
            const identifier = 'changeUserPresence';
            this.logError(identifier, error);
        }
    }


    
    

    
}

module.exports = {
    xmClient
};
