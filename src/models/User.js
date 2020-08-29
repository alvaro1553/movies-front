import {md5} from '../lib/hash.js';

export default class User {

    constructor(){
        this._email = '';
        this._secret = null;
        this._level = null;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        if(!value) throw new Error('Email cannot be empty')
        this._email = value;
    }

    get secret() {
        return this._secret;
    }

    get level() {
        return this._level;
    }

    set level(value) {
        if(!value) throw new Error('Level cannot be empty')
        this._level = value;
    }


    generateSecret(passInput) {
        if(!passInput) throw new Error('Pass cannot be empty')
        this._secret = md5(passInput);
    }

    toJson(){
        return {
            "email": this.email,
            "secret": this.secret,
            "level": this.level
        }
    }

}