// import {GridFSPromise} from 'gridfs-promise'
import { environment } from '../config/environment';
import * as crypto from 'crypto'
import * as path from 'path'
import * as multer from 'multer'
import * as mongoose from 'mongoose'
import * as GridFsStorage from "multer-gridfs-storage"


export class FileDriver{
    
    gfs: any
    upload:any
    storage:any
    conn: any

    constructor(){
    this.conn = mongoose.createConnection(environment.db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    this.conn.once("open", () => {

      this.gfs = new mongoose.mongo.GridFSBucket(this.conn.db, {
        bucketName: "uploads"
      });
    });
    
    // Storage
    var storage = new GridFsStorage({
      url: environment.db.url,
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }

            const filename = buf.toString("hex") + path.extname(file.originalname);
            
            const fileInfo = {
              filename: filename,
              bucketName: "uploads"
            };
            resolve(fileInfo);
          });
        });
      }
    });
    
    this.upload = multer({
      storage
    });
    }
}

