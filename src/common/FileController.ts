import * as mongoose from "mongoose";
import { fileDriver } from "../main";
import { InternalServerError } from "restify-errors";

class FileController {
    upload(req, res, next) {
        return res.json({ file: (<any>req).file });
    }
    download(req, res, next) {
        fileDriver.gfs
            .find({
                filename: req.params.filename,
            })
            .toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.json(400, {
                        err: "no files exist",
                    });
                }
                fileDriver.gfs
                    .openDownloadStreamByName(req.params.filename)
                    .pipe(res);
            });
    }
    delete(req, res, next) {
        fileDriver.gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
            if (err) return res.json({ err: err.message });
            return res.json(204, "Deletado")
        });
    }

    getAll(req, res, next) {
        if (!fileDriver.gfs) {
            return next(new InternalServerError('Internal server Error'))
        }
        fileDriver.gfs.find().toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.json({
                    files: false
                });
            } else {
                const f = files
                    .map(file => {
                        if (
                            file.contentType === "image/png" ||
                            file.contentType === "image/jpeg"
                        ) {
                            file.isImage = true;
                        } else {
                            file.isImage = false;
                        }
                        return file;
                    })
                    .sort((a, b) => {
                        return (
                            new Date(b["uploadDate"]).getTime() -
                            new Date(a["uploadDate"]).getTime()
                        );
                    });

                return res.json({
                    files: f
                });
            }
        });
    }
}
export const fileController = new FileController();
