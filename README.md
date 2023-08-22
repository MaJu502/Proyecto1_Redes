# XMPP Client

A command-line XMPP client that allows users to interact with an XMPP server, manage accounts, send and receive messages, manage contacts, and perform various other tasks related to XMPP communication.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Description

This XMPP client program is designed to provide users with a command-line interface for interacting with an XMPP server. It offers a range of functionalities for managing XMPP accounts, contacts, and messages. Users can sign up, log in, change their presence status, send and receive direct messages (DMs), manage group chats, and more.

## Features

- User account signup, login, logout.
- Change presence status (e.g., "available," "away").
- Manage contact lists, add contacts, and retrieve contact information.
- Send and receive private messages (DMs).
- Handle notifications for new messages, presence changes, subscription requests, and file sharing.
- Create and manage group chats.
- Send files to other users.
- Error logging for better troubleshooting.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/MaJu502/Proyecto1_Redes.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Proyecto1_Redes
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

## Usage

1. Run the XMPP client program with the given command:

   ```bash
   npm run nice
   ```

2. When prompted, enter users JID in the format `user@alumchat.xyz` (e.g., `johndoe@alumchat.xyz`).

3. Follow the on-screen instructions to navigate through different options and functionalities.

## Dependencies

This program uses the following dependencies:

- `@xmpp/client`: A library for building XMPP clients in Node.js.
- `fs`: A built-in Node.js module for working with the file system.
- `readline`: A built-in Node.js module for reading user input.

## Contributing

Contributions to this project are welcome. You can contribute by:

- Reporting issues or suggesting enhancements on the [GitHub repository](https://github.com/your-username/xmpp-client).
- Forking the repository, making changes, and creating pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

The server for this program is `@alumchat.xyz`. When prompted for your JID, enter it in the format `user@alumchat.xyz` (e.g., `example@alumchat.xyz`).

For more information, refer to the [official XMPP documentation](https://xmpp.org/) used to create this project.
