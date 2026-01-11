import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  name: string;
  email: string;
  password: string;
  cartItems: {
    quantity: number;
    product: Schema.Types.ObjectId;
  }[];
  role: "customer" | "admin";
  comparePassword(pass: string): Promise<boolean>;
}

const userSchmea = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

userSchmea.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    this.password = bcrypt.hashSync(this.password, 10);
  } catch (error) {
    return null;
  }
});

userSchmea.methods.comparePassword = function (pass: string): Promise<boolean> {
  return bcrypt.compare(pass, this.password);
};

const User = model<IUser>("User", userSchmea);

export default User;
