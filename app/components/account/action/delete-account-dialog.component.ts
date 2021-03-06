import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

import { AccountService } from "app/services";

@Component({
    selector: "bex-delete-account-dialog",
    templateUrl: "delete-account-dialog.html",
})
export class DeleteAccountDialogComponent {
    public accountName: string;
    public accountId: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteAccountDialogComponent>,
        private accountService: AccountService) {
    }

    public destroyAccount() {
        this.accountService.delete(this.accountId).subscribe({
            error: (error) => { console.error("destroyAccount() :: error: ", error); },
            complete: () => this.dialogRef.close(), // todo: clear current selection, show notification
        });
    }
}
