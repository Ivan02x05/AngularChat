import www from "./www/www";
import socket from "./www/socket";

www()
    .then(_ => socket(_));
