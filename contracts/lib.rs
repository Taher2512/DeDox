use anchor_lang::prelude::*;

declare_id!("Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC");

#[program]
pub mod document_storage {
    use super::*;

    // ... (previous functions remain the same)
    pub fn hello_world(ctx: Context<HelloWorld>) -> Result<()> {
        msg!("Hello, world! This is a test message from the Solana program.");
        Ok(())
    }
   pub fn add_document(
        ctx: Context<AddDocument>,
        document_id: u64,
        image_hash: String,
        date: i64,
        signers: Vec<Pubkey>,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        document.id = document_id;
        document.image_hash = image_hash;
        document.uploader = *ctx.accounts.user.key;
        document.date = date;
        document.signers = signers;

        Ok(())
    }
     pub fn add_signed_document(
        ctx: Context<AddSignedDocument>,
        doc_id: u64,
        signedBy: Pubkey,
    ) -> Result<()> {
        let signed_document = &mut ctx.accounts.signed_document;
        signed_document.doc_id = doc_id;
        signed_document.signed_by = signedBy;

        Ok(())
    }
   pub fn add_user_photo(ctx: Context<AddUserPhoto>, image_hash: String) -> Result<()> {
    msg!("Starting add_user_photo");
    let user_photo = &mut ctx.accounts.user_photo;
    
    msg!("Image hash: {}", image_hash);
    msg!("User key: {}", ctx.accounts.user.key);

    user_photo.image_hash = image_hash;
    user_photo.user = *ctx.accounts.user.key;

    msg!("User photo added successfully");
    Ok(())
}

}


#[derive(Accounts)]
pub struct GetAllDocuments<'info> {
    pub documents: Account<'info, Document>,
}



// ... (other accounts and structs remain the same)
#[derive(Accounts)]
pub struct HelloWorld<> {
    // No accounts required
}
#[derive(Accounts)]
#[instruction(document_id: u64, image_hash: String, date: i64, signers: Vec<Pubkey>)]
pub struct AddDocument<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 256 + 32 + 8 + (32 * signers.len()), // Dynamic space based on number of signers
        seeds = [b"document", user.key().as_ref(), &document_id.to_le_bytes()],
        bump
    )]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction( doc_id: u64,signedBy: Pubkey)]
pub struct AddSignedDocument<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32, 
        seeds = [b"signeddocument", user.key().as_ref(), &doc_id.to_le_bytes()],
        bump
    )]
    pub signed_document: Account<'info, SignedDocument>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddUserPhoto<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 4 + 256 + 32, // discriminator + string length + max string size + pubkey
        seeds = [b"user_photo", user.key().as_ref()],
        bump
    )]
    pub user_photo: Account<'info, UserPhoto>,
  
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Document {
    pub id: u64,
    pub image_hash: String,
    pub uploader: Pubkey,
    pub signers: Vec<Pubkey>,
    pub date: i64,
}

#[account]
pub struct SignedDocument {
    pub doc_id: u64,
    pub signed_by: Pubkey,
}

#[account]
pub struct UserPhoto {
    pub image_hash: String,
    pub user: Pubkey,
}



#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct DocumentInfo {
    pub id: u64,
    pub image_hash: String,
    pub uploader: Pubkey,
    pub date: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct SignedDocumentInfo {
    pub doc_id: u64,
    pub signed_by: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UserPhotoInfo {
    pub image_hash: String,
    pub user: Pubkey,
}