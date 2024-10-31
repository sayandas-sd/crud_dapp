#![allow(clippy::result_large_err)]

use anchor_lang::{prelude::*, solana_program::sysvar::recent_blockhashes::Entry};

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod crud_app {
    use super::*;

    pub fn create_todolist(ctx: Context<CreateState>, title: String, message: String) -> Result<()> {
        let todo_enrty = &mut ctx.accounts.todo_entry;
        todo_enrty.owner = *ctx.accounts.owner.key;
        todo_enrty.title = title;
        todo_enrty.message = message;

        Ok(())
    }

    pub fn update_todolist(ctx: Context<UpdateState>, _title: String, message: String) -> Result<()> {
      let todo_entry = &mut ctx.accounts.todo_entry;
      todo_entry.message = message;

      Ok(())
    }

    pub fn delete_todolist(_ctx: Context<DeleteState>, _title: String) -> Result<()> {

      Ok(())
    }
}


//create
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateState<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    space = 8 + EntryState::INIT_SPACE,
    payer = owner,
  )]
  pub todo_entry: Account<'info, EntryState>,

  #[account(mut)]
  pub owner: Signer<'info>,
  
  pub system_program: Program<'info, System>,
}
 
//update

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateState<'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + EntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero =  true,
  )]

  pub todo_entry: Account<'info, EntryState>,

  #[account(mut)]

  pub owner: Signer<'info>,

  pub system_program:  Program<'info, System>

}


//delete

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteState<'info> {
  #[account(
     mut,
     seeds = [title.as_bytes(), owner.key().as_ref()],
     bump,
     close= owner,
  )]

  pub todo_entry: Account<'info, EntryState>,

  #[account(mut)]

  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct EntryState {
  pub owner: Pubkey,
  #[max_len(50)]
  pub title: String,
  #[max_len(150)]
  pub message: String,
}