import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";
import * as bcrypt from "bcrypt";
import { environment } from "../../config/environment";

export interface User extends mongoose.Document {
  nome: String;
  email: String;
  userProjects: [];
  tokenPwdRecover: String;
  credenciais: {
    permissao: String;
  }
}
export interface UserModel extends mongoose.Model<User> {
  matches(password: String): boolean;
}

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  userProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: false,
  },
],

  credenciais: {
    permissao: {
      type: String,
      enum: ["Administrator", "RegularUser"],
      default: "RegularUser"
    },
    senha: {
      type: String,
      default: "WorldBank123",
      required: false,
      select: false,
    },
  },
  tokenPwdRecover: {
    type: String,
    select: false
  },

  criadoEm: {
    type: Date,
    default: Date.now,
  },
});


UserSchema.plugin(uniqueValidator);

UserSchema.methods.matches = function (password: string): boolean {
  return bcrypt.compareSync(password, this.credenciais.senha);
};

UserSchema.methods.hasAny = function (...profiles: string[]): boolean {
  return profiles.some(
    (profile) => this.credenciais.permissao.indexOf(profile) !== -1
  );
};

var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const hashPassword = (obj, next) => {
  bcrypt
    .hash(obj.credenciais.senha, environment.security.saltRounds)
    .then((hash) => {
      obj.credenciais.senha = hash;
      next();
    })
    .catch(next);
};
const hashUpdatedPassword = (obj, next) => {
  bcrypt
    .hash(obj["credenciais.senha"], environment.security.saltRounds)
    .then((hash) => {
      obj["credenciais.senha"] = hash;
      next();
    })
    .catch(next);
};
const saveMiddleware = function (next) {
  const user: User = this;
  // console.log(user.isNew)
  // console.log(user.isModified("credenciais.senha"))
  if(user.isNew){
    hashPassword(user, next);
  }else if (!user.isModified("credenciais.senha")) {
    next();
  } else {
    hashPassword(user, next);
  }
};
const updateMiddleware = function (next) {
  if ("credenciais.senha" in this.getUpdate()) {
    hashUpdatedPassword(this.getUpdate(), next);
  } else {
    next();
  }
};

UserSchema.pre("save", saveMiddleware);
UserSchema.pre("findOneAndUpdate", updateMiddleware);
UserSchema.pre("updateOne", updateMiddleware);


export const User = mongoose.model<User,UserModel>(
  "User",
  UserSchema
);
