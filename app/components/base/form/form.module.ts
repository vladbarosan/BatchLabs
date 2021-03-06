import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { ButtonsModule } from "../buttons";
import { ActionFormComponent } from "./action-form";
import { CreateFormComponent } from "./create-form";
import { FormErrorComponent } from "./form-error";
import { ServerErrorComponent } from "./server-error";

// components
// Add submodules there
const modules = [
];

// Add subcomponnent not in a module here
const components = [
    ActionFormComponent,
    CreateFormComponent,
    FormErrorComponent,
    ServerErrorComponent,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        ButtonsModule,
        FormsModule,
        MaterialModule.forRoot(),
        ReactiveFormsModule,
        RouterModule,
        ...modules,
    ],
    providers: [
    ],
})
export class FormModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: FormModule,
            providers: [],
        };
    }
}
