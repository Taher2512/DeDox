/*eslint-disable*/
import * as borsh from "@project-serum/borsh";

export class User {
  image_hash;
  user;

  constructor(image_hash, user) {
    this.image_hash = image_hash;
    this.user = user;
  }

  static borshUserAccountSchema = borsh.struct([
    borsh.u8("add_user_photo"),
    borsh.str("image_hash"),
   borsh.publicKey("user")
  ]);

//   static mocks = [
//     new User(
//       "TheGodfather",
//       "https://m.media-amazon.com/images/M/MV5BZTFiODA5NWEtM2FhNC00MWEzLTlkYjgtMWMwNzBhYzlkY2U3XkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg"
//     ),
//   ];

  borshInstructionSchema = borsh.struct([
    borsh.u8("add_user_photo"),
    borsh.str("image_hash"),
   borsh.publicKey("user")
  ]);

  serialize() {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer) {
    if (!buffer) {
      return null;
    }

    try {
      const { image_hash, user } = this.borshUserAccountSchema.decode(buffer);
      return new User(image_hash, user);
    } catch (error) {
      console.log("Deserialization error:", error);
      return null;
    }
  }
}