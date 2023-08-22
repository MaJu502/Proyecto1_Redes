/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
*/

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
        this.contactosRoster = []; // Array para almacenar los contactos
        this.userJID;
        this.addMessage = [];
        this.notifications = [];
        this.notifiCONT = 0;
        this.chatsgroups = [];
        this.addGroupMessages = [];
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
            console.log("\n >> Login successful! JID:\n", jid.toString());
            this.userJID = jid.toString().split("/")[0];
            this.JIDdevice = jid.toString();
            
            // Cambiar el estado de presencia a "activo"
            const presenceStanza = xml(
                "presence",
                { xmlns: "jabber:client" },
                xml("show", {}, "chat"),
                xml("status", {}, "Active")
            );
            this.conn.send(presenceStanza);
        });
    
        this.conn.on("error", (err) => {
            const identifier = "login";
            this.logError(identifier, err);
        });

        
    
        try {
            this.conn.start().then(() => {

                
                this.conn.on("stanza", (stanza) => {
                    //console.log("\n\n\n >>>",stanza)
                    if (stanza.is("message") && stanza.attrs.type === "chat") {
                        const contactJID = stanza.attrs.from;
                        const messageBody = stanza.getChildText("body");

                        if (messageBody === null) {

                            console.log(` >> The user ${contactJID} has read your message.`)

                        } else {

                            console.log(` >> New messages from ${contactJID}`);
                        
                            this.notifiCONT += 1;

                            const fileCode = stanza.getChildText('attachment');
                            if (fileCode) {
                                // se envio un archivo
                                const decodeFileInfo = Buffer.from(fileCode, 'base64');
                                const filepath = `./files/${messageBody}`
                                fs.writeFileSync(filepath, decodeFileInfo);
                                console.log(' >> File has been saved in route:', filepath)
                                this.notifications.push(` New filed shared from: ${contactJID}...`);
                            } else {
                                const senderJID = stanza.attrs.from.split("/")[0];
                                const messageData = {
                                    sender: senderJID,
                                    message: messageBody,
                                    timestamp: new Date(),
                                };
                                this.addMessage.push((contactJID, messageData));
                                this.notifications.push(` New message from: ${contactJID} check your messages...`);
                                
                            }

                            

                        }
                        
                    }

                    if (stanza.is("message") && stanza.attrs.type === "groupchat") {
                        if (!this.chatsgroups.includes(stanza.attrs.from.split("@")[0])) {
                            this.chatsgroups.push(stanza.attrs.from.split("@")[0]);
                        }

                        const groupname = stanza.attrs.from.split("@")[0];
                        const senderJID = stanza.attrs.from.split("/")[1];
                        const messageData = {
                            sender: senderJID,
                            message: messageBody,
                            timestamp: new Date(),
                        };

                        if (!this.addGroupMessages[groupname]) {
                            this.addGroupMessages[groupname] = [];
                        }
                        
                        this.addGroupMessages[groupname].push([senderJID, messageData]);

                    }

                    if (stanza.is("message") && stanza.attrs.from.toString().includes("conference")){

                        if (!this.chatsgroups.includes(stanza.attrs.from.split("@")[0])) {
                            this.chatsgroups.push(stanza.attrs.from.toString());
                        }
                        this.conn.send(xml(
                            "presence",
                            {
                                to: stanza.attrs.from.toString()
                            }
                        ))
                    }

                    if (stanza.attrs.type === "subscribe") {
                        console.log(" >> Incoming contact request, approved!")
                        this.notifications.push(` New suscription from ${stanza.attrs.from} accepted.`)
                        // Aprobar automáticamente la solicitud de contacto
                        const approvePresence = xml(
                          "presence",
                          { to: stanza.attrs.from, type: "subscribed" }
                        );
                        this.conn.send(approvePresence);
                    }

                    if (stanza.is("presence")) {
                        const presenceType = stanza.getChildText("status");
                        const contactJID = stanza.attrs.from;
                        const contactJIDWithoutResource = contactJID.toString().split("/")[0].trim();
                        const existingContact = this.contactosRoster.find(contact => contact[0] === contactJIDWithoutResource);
                        let  normalizedPresenceType;
                        

                        if(presenceType === null){
                            normalizedPresenceType = "online";
                            if (!existingContact) {
                                this.contactosRoster.push([contactJIDWithoutResource, "Active"]);
                            }

                        } else {
                            normalizedPresenceType = presenceType.toLowerCase().trim();
                            if (!existingContact) {
                                this.contactosRoster.push([contactJIDWithoutResource, stanza.getChildText("status"), presenceType]);
                            }
                        }
                        

                        if(contactJIDWithoutResource !== this.userJID) {
                            const tiempitostatus = new Date()
                            const hora = tiempitostatus.getHours();
                            const minutos = tiempitostatus.getMinutes();
                            const segundos = tiempitostatus.getSeconds();
                            
                            

                            if (
                                normalizedPresenceType === "offline" ||
                                normalizedPresenceType === "away" ||
                                normalizedPresenceType === "unavailable"
                            ) {
                                const contactJIDToRemove = contactJIDWithoutResource;

                                this.contactosRoster = this.contactosRoster.map(contact => {
                                    if (contact[0] === contactJIDToRemove) {
                                        return [contactJIDToRemove, "Offline"]; // Actualiza el estado
                                    }
                                    return contact;
                                });
                            }


                            if (presenceType === null) {
                                const contactJIDToRemove = contactJIDWithoutResource;


                                this.contactosRoster = this.contactosRoster.map(contact => {
                                    if (contact[0] === contactJIDToRemove) {
                                        return [contactJIDToRemove, "Active"]; // Actualiza el estado
                                    }
                                    return contact;
                                });
                            }

                            console.log(`\n >> The user ${contactJID} is now ${presenceType === null ? 'online' : presenceType}.\n`);
                            this.notifications.push(` ${contactJID} changed status to ${presenceType === null ? 'online' : presenceType} at ${hora}:${minutos}:${segundos}.\n`);


                        }
                        
                        
                    }

                    if (this.notifiCONT > 0){
                        console.log("\n\n >> You have new notifications!\n")
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
            // Cambiar el estado de presencia a "offline"
            const presenceStanza = xml(
                "presence",
                { xmlns: "jabber:client" },
                xml("show", {}, "chat"),
                xml("status", {}, "Offline")
            );
            this.conn.send(presenceStanza);

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
                "presence",
                { from: this.userJID, to: contactJID, type: "subscribe" }
            );

            this.conn.send(subscribeStanza);
            this.contactosRoster.push(contactJID);

            console.log(` >> Sent contact subscription request to ${contactJID}`);
        } catch (error) {
            const identifier = "sendcontactosRosterubscription";
            this.logError(identifier, error);
        }
    }

    async getContactList() {
    
        this.conn.send(xml(
            'iq',
            { type: 'get', id: 'roster1' },
            xml('query', { xmlns: 'jabber:iq:roster' })
        ));

        const formattedContacts = this.contactosRoster.map(contact => `  -> ${contact[0]}  (${contact[1]})\n            message: ${contact[2]}`).join('\n');

        console.log(formattedContacts);


    }

    async getContactInfo(jiduser) {
        try {

            const contact = this.contactosRoster.find(item => item[0] === jiduser);
                if (contact) {
                    const nombreUsuario = jiduser; // Puedes asignar un nombre si lo tienes disponible
                    const estado = contact[1];
                    console.log(` >> Contact ${nombreUsuario} is currently ${estado}`);
                } else {
                    console.log(` >> Contact ${jiduser} is not in the list.`);
                
                }          

        } catch (error) {
            const identifier = "getContactInfo";
            this.logError(identifier, error);
            console.error(" >> ERROR: check error-log-xmpp.txt for more info.");
        }
    }

    async changeUserPresence(presenceType, statusMessage = "") {
        try {
            const presenceStanza = xml(
                "presence",
                { type: presenceType },
                xml("status", {}, statusMessage)
            );

            this.conn.send(presenceStanza);

            console.log(` >> You have changed your user's status to: ${presenceType}`);
        } catch (error) {
            const identifier = "changeUserPresence";
            this.logError(identifier, error);
        }
    };

    async getMessagesByUsername(username) {
        // Filtrar los mensajes por el nombre de usuario
        
        const userMessages = this.addMessage.filter(message => message.sender === username);

        if (userMessages.length === 0) {
            console.log(` >> No messages were found from user: ${username}`);
        } else {
            console.log(`Messages sent from: ${username}`);
            userMessages.forEach((message) => {
                console.log(`   -> ${message.message}\n        (${message.timestamp})`);
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
                "message",
                { to: userJID, type: "chat" },
                xml("body", {}, bodied)
            );
            
            const response = await this.conn.send(messageStanza);
        } catch (error) {
            const identifier = "sendMessage";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to send message (check error-log-xmpp.txt for more info).");
        }
    }

    async showGroupChats() {
        console.log(this.chatsgroups);
    }

    async sendMessagesGroup(group, bodied) {

        try {
            const messageStanza = xml(
                "message",
                { to: `${group}@conference.alumchat.xyz`, type: "groupchat" },
                xml("body", {}, bodied)
            );
            
            const response = await this.conn.send(messageStanza);
        } catch (error) {
            const identifier = "sendMessageGroup";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to send message to groupchat (check error-log-xmpp.txt for more info).");
        }
    }

    async grouped1(groupn, nick){
        const createGroupPresence = xml(
            'presence',
            { to: `${groupn}@conference.alumchat.xyz` },
            xml('x', { xmlns: 'http://jabber.org/protocol/muc' }),
            xml('x', { xmlns: 'jabber:x:conference', jid: `${groupn}@conference.alumchat.xyz` }),
            xml('nick', { xmlns: 'http://jabber.org/protocol/nick' }, nick)
        );
        this.conn.send(createGroupPresence);
    }

    async invitedgroup(grup,usuarioj){
        
        const inviteMessage = xml(
            'message',
            { to: `${grup}@conference.alumchat.xyz` },
            xml('x', { xmlns: 'http://jabber.org/protocol/muc#user' },
                xml('invite', { to: usuarioj })
            )
        );
        this.conn.send(inviteMessage);
    }

    async joinGroup(userJID, room) {
        userJID = this.userJID;

        try {
            
            const groupchatStanza = xml(
                "presence",
                {
                  to: `${room}@conference.alumchat.xyz/${userJID}`
                }
              );
            
              const temp = xml(
                "x",
                {
                  xmlns: "http://jabber.org/protocol/muc#user"
                }
              );
            
              const itemstanza = xml(
                "item",
                {
                  jid: `${userJID}`,
                  affiliation: "owner",
                  role: "moderator"
                }
              );
            
              temp.append(itemstanza);
              groupchatStanza.append(temp);

              // enviar stanza
              this.conn.send(groupchatStanza)


        } catch (error) {
            const identifier = "createGroupChat";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to create group chat (check error-log-xmpp.txt for more info).");
        }
    }

    async addUserGroup(userADD, roomed){
        try {
            
            const addusergroupStanza = xml(
                "iq",
                {
                    to: `${roomed}@conference.alumchat.xyz`,
                    type: "set",
                    id: "addUserToRoom"
                }, xml(
                    "query", {
                        xmlns: "http://jabber.org/protocol/muc#admin"
                    }, xml (
                        "item", {
                            jid: userADD,
                            affiliation: "member"
                        }
                    )
                )
            )

            this.conn.send(addusergroupStanza);

        } catch (error) {
            const identifier = "addUserToGroupchat";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to add user to group chat (check error-log-xmpp.txt for more info).");
        }
    }

    async mostrarNOTIS() {

        try {

            console.log("\n\n-----------------------------------------------------------------------------------------\n")
            console.log(` >> Your new notifications: `);
            this.notifications.forEach((noti) => {
                console.log(`   -> ${noti})`);
            });
            console.log("\n-----------------------------------------------------------------------------------------\n\n")
            this.notifiCONT = 0;
            this.notifications = [];

        } catch (error) {
            const identifier = "showNotifications";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to show notifications (check error-log-xmpp.txt for more info).");
        }

    }

    async sendFiles(rutaArchivo, userjid) {
        const fileData = fs.readFileSync(rutaArchivo, { encoding: 'base64' })

        await this.conn.send(
            xml(
                'message',
                { to: userjid,
                  type: 'chat' 
                },
                    xml('body', {}, rutaArchivo.replace('./', '')),
                    xml('attachment', { 
                    xmlns: 'urn:xmpp:attachment',
                    id: 'attachment1',
                    encoding: 'base64'
                }, fileData)
            )
        )
        console.log(`\n\n >> The file ${rutaArchivo.replace('./', '')} sento to user: ${userjid}\n`);
    }

    
}

module.exports = {
    xmClient
};
