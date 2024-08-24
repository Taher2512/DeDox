use anchor_lang::prelude::*;

declare_id!("2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk");

#[program]
pub mod document_storage {
    use super::*;

    // ... (previous functions remain the same)
   pub fn send_document(
        ctx: Context<SendDocument>,
        id: u64,  // Now accepting id from client
        image_hash: String,
        uploader: Pubkey,
        signers: Vec<Pubkey>,
        date: i64,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        document.id = id;  // Use the provided id
        document.image_hash = image_hash;
        document.uploader = uploader;
        document.signers = signers;
        document.date = date;

        Ok(())
    }
     pub fn add_signed_document(
        ctx: Context<AddSignedDocument>,
        doc_id: u64,
        signature: Pubkey,
    ) -> Result<()> {
        let signed_document = &mut ctx.accounts.signed_document;
        signed_document.doc_id = doc_id;
        signed_document.signed_by = signature;

        Ok(())
    }
   pub fn add_user_photo(
    ctx: Context<AddUserPhoto>,
    image_hash: String,
) -> Result<()> {
    let user_photo = &mut ctx.accounts.user_photo;
    user_photo.image_hash = image_hash;
    user_photo.user = ctx.accounts.user.key();

    Ok(())
}
    pub fn get_all_documents(ctx: Context<GetAllDocuments>) -> Result<Vec<DocumentInfo>> {
        let documents = &ctx.accounts.documents;
        let document_info = DocumentInfo {
            id: documents.id,
            image_hash: documents.image_hash.clone(),
            uploader: documents.uploader,
            signers: documents.signers.clone().try_into().unwrap_or([Pubkey::default(); 10]),
            date: documents.date,
        };

        Ok(vec![document_info])
    }

    pub fn get_all_signed_documents(ctx: Context<GetAllSignedDocuments>) -> Result<Vec<SignedDocumentInfo>> {
        let signed_documents = &ctx.accounts.signed_documents;
        let signed_document_info = SignedDocumentInfo {
            doc_id: signed_documents.doc_id,
            signed_by: signed_documents.signed_by,
        };

        Ok(vec![signed_document_info])
    }

    pub fn get_all_user_photos(ctx: Context<GetAllUserPhotos>) -> Result<Vec<UserPhotoInfo>> {
        let user_photos = &ctx.accounts.user_photos;
        let user_photo_info = UserPhotoInfo {
            image_hash: user_photos.image_hash.clone(),
            user: user_photos.user,
        };

        Ok(vec![user_photo_info])
    }
}

#[derive(Accounts)]
pub struct GetAllDocuments<'info> {
    pub documents: Account<'info, Document>,
}

#[derive(Accounts)]
pub struct GetAllSignedDocuments<'info> {
    pub signed_documents: Account<'info, SignedDocument>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetAllUserPhotos<'info> {
    pub user_photos: Account<'info, UserPhoto>,
    pub user: Signer<'info>,
}

// ... (other accounts and structs remain the same)
#[derive(Accounts)]
pub struct SendDocument<'info> {
    #[account(init, payer = user, space = 8 + 8 + 32 + 32 + 32 * 10 + 8)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddSignedDocument<'info> {
    #[account(init, payer = user, space = 8 + 8 + 32)]
    pub signed_document: Account<'info, SignedDocument>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddUserPhoto<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 4 + 256 + 32, // discriminator + string length + max string size + pubkey
        seeds = [b"user_photo", user.key().as_ref()],
        bump
    )]
    pub user_photo: Account<'info, UserPhoto>,
    #[account(mut)]
    pub user: Signer<'info>,
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
    pub signers: [Pubkey;10],
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