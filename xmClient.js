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
        this.addMessage = [];
        this.notifications = [];
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
            
        
        } catch (error) {
            const identifier = "signup";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during signup (check error-log-xmpp.txt for info).");
            
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
    
        this.conn.on("online", async (jid) => {
            console.log(" >> Login successful! JID:\n", jid.toString());
            this.userJID = jid.toString().split('/')[0];
            
            // Cambiar el estado de presencia a "activo"
            const presenceStanza = xml(
                'presence',
                { xmlns: 'jabber:client' },
                xml('show', {}, 'chat'),
                xml('status', {}, 'Active')
            );
            this.conn.send(presenceStanza);
        });
    
        this.conn.on("error", (err) => {
            const identifier = "login";
            this.logError(identifier, err);
        });

        
    
        try {
            this.conn.start().then(() => {

                
                this.conn.on('stanza', (stanza) => {
                    //
                    if (stanza.is('message') && stanza.attrs.type === 'chat') {
                        const contactJID = stanza.attrs.from;
                        const messageBody = stanza.getChildText("body");
                        console.log(`\n >> You have a new message from: ${contactJID} check your messages...`);
                        this.notifications.push(` >> New message from: ${contactJID} check your messages...`)

                        const senderJID = stanza.attrs.from.split('/')[0];
                        const messageData = {
                            sender: senderJID,
                            message: messageBody,
                            timestamp: new Date(),
                        };
                        this.addMessage.push((contactJID, messageData));
                    }

                    if (stanza.attrs.type === 'subscribe') {
                        console.log(" >> Incoming contact request, approved!")
                        // Aprobar automáticamente la solicitud de contacto
                        const approvePresence = xml(
                          'presence',
                          { to: presence.attrs.from, type: 'subscribed' }
                        );
                        xmppClient.send(approvePresence);
                      }
                });
            });
                
        } catch (error) {
            const identifier = "login";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during login: user might not exist (check error-log-xmpp.txt for info).");
            
        }
    }
    

    async logout() {
        try {
            // Espera a que se detenga la conexión
            await this.conn.stop();
            console.log(" >> Logout successful!")
            
        } catch (error) {
            const identifier = "logout";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during logout (check error-log-xmpp.txt for info).");
            
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

    async getContactList() {
        try {

            const rosterIQ = xml(
                'iq',
                { type: 'get' },
                xml('query', { xmlns: 'jabber:iq:roster' })
              );
            
              const rosterResponse = await this.conn.send(rosterIQ);
            
              const sortedContacts = rosterResponse.getChild('query').getChildren('item')
                .map((contact) => {
                  return {
                    jid: contact.attrs.jid,
                    name: contact.attrs.name || '',
                  };
                })
                .sort((a, b) => a.name.localeCompare(b.name));
            
              console.log('Sorted Contacts:');
              sortedContacts.forEach((contact) => {
                console.log(`JID: ${contact.jid}, Name: ${contact.name}`);
              });

        } catch (error) {

            const identifier = 'getContactList';
            this.logError(identifier, error);
            console.error(" >> ERROR: check error-log-xmpp.txt for more info.");

        }
    }

    async getContactInfo(jiduser) {
        try {
            
            this.conn.send(xml('presence', { to: jiduser }));

            // Manejar la respuesta de presencia
            this.conn.on('presence', (presence) => {
                if (presence.attrs.from === jiduser) {
                console.log(`Received presence from: ${jiduser}`);
                // Aquí puedes procesar la respuesta de presencia, que podría incluir información del usuario
                }
            });

        } catch (error) {
            const identifier = 'getContactInfo';
            this.logError(identifier, error);
            console.error(" >> ERROR: check error-log-xmpp.txt for more info.");
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
    };

    async getMessagesByUsername(username) {
        // Filtrar los mensajes por el nombre de usuario
        console.log(this.addMessage)
        
        const userMessages = this.addMessage.filter(message => message.sender === username);

        if (userMessages.length === 0) {
            console.log(`No se encontraron mensajes del sender: ${username}`);
        } else {
            console.log(`Mensajes del sender: ${username}`);
            userMessages.forEach((message) => {
                console.log(`    ${message.message}\n    (${message.timestamp})`);
            });
        }
    }

    async getUniqueSenderUsernames() {
        const senderUsernames = [];
        
        this.addMessage.forEach((message) => {
            const senderUsername = message.sender;
            if (!senderUsernames.includes(senderUsername)) {
                senderUsernames.push(senderUsername);
            }
        });
        
        senderUsernames.forEach((element) => {
            console.log(element);
        });
    }

    async sendMessagesDM(userJID, bodied) {

        try {
            const messageStanza = xml(
                'message',
                { to: userJID, type: 'chat' },
                xml('body', {}, bodied)
            );
            
            const response = await this.conn.send(messageStanza);
            console.log("Message sent:", response.toString());
        } catch (error) {
            const identifier = 'sendMessage';
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to send message (check error-log-xmpp.txt for more info).");
        }
    }

    
}

module.exports = {
    xmClient
};
