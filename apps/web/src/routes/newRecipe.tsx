import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Controller, useForm } from "react-hook-form";
import { Button } from "@GraceRecipe/ui/components/button";
import {toast} from 'sonner'
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@GraceRecipe/ui/components/input";
import {Textarea} from "@GraceRecipe/ui/components/textarea";
import {Separator} from "@GraceRecipe/ui/components/separator";
import {
  Field,
  FieldError,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldDescription
} from "@GraceRecipe/ui/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@GraceRecipe/ui/components/card";

import { z } from "zod"
const formSchema = z.object(
  {
    title: z.string().min(1,{message:"Recipe title cannot be blank."}),
      section: z.string().min(1,{message:"Recipe section cannot be blank."}),
      creditAuthor: z.string(),
      creditLink: z.string(),
      ingredients: z.string().min(1,{message:"Ingredients cannot be blank."}),
      instructions: z.string().min(1,{message:"Instructions cannot be blank."})
  })

export const Route = createFileRoute('/newRecipe')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
        <main id="display-area">
            <NewRecipeForm />
        </main>
    )
}



function NewRecipeForm() {
  const onSubmit = async (value: z.infer<typeof formSchema>) => {
      toast("You submitted the following values:",{
        description: (
          <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2"
        }
      })
    };

  const form = useForm({
    defaultValues: {
      title: "",
      section: "",
      creditAuthor: "",
      creditLink: "",
      ingredients: "",
      instructions: ""
    },
    mode:"onSubmit",
      })

    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>New Recipe</CardTitle>
          <CardDescription>Let's add something tasty to the site!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          
          <form
            id="new-recipe-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit);
            }
          }
          >
          <FieldSet>
            <FieldDescription>Recipe Details</FieldDescription>
            <FieldGroup>
              <Controller
              name="title"
              control={form.control}
              render={({field, fieldState}) => {
              return (
              <Field data-invalid={fieldState.invalid}>
                <Input 
                  id={field.name} 
                  name={field.name} 
                  defaultValue=""
                  required
                  placeholder="Recipe Title"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                </Field>
              )
              } } />
            </FieldGroup>
            <FieldGroup>
              <Controller
              name="section"
              control={form.control}
              render={({field, fieldState}) => {
              return (
              <Field data-invalid={fieldState.invalid}>
                <Input 
                  id={field.name} 
                  name={field.name} 
                  required
                  defaultValue=""
                  placeholder="Recipe Section"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                </Field>
              )
              } } />
            </FieldGroup>
          </FieldSet>
          <Separator /><br />
          <FieldSet>
            <FieldDescription>Recipe Credit</FieldDescription>
            <FieldGroup>
              <Controller
              name="creditAuthor"
              control={form.control}
              render={({field, fieldState}) => {
              return (
              <Field data-invalid={fieldState.invalid}>
                <Input 
                  id={field.name} 
                  name={field.name} 
                  required
                  defaultValue=""
                  placeholder="Author"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                </Field>
              )
              } } />
            </FieldGroup>
            <FieldGroup>
              <Controller
              name="creditLink"
              control={form.control}
              render={({field, fieldState}) => {
              return (
              <Field data-invalid={fieldState.invalid}>
                <Input 
                  id={field.name} 
                  name={field.name} 
                  required
              defaultValue=""
                  placeholder="Credit Link"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                </Field>
              )
              } } />
            </FieldGroup>
          </FieldSet>
          <Separator /><br />
          <FieldGroup>
            <Controller
            name="ingredients"
            control={form.control}
            render={({field, fieldState}) => {
            return (
            <Field data-invalid={fieldState.invalid}>
              <Textarea 
                id={field.name} 
                name={field.name} 
                defaultValue=""
                required
                placeholder="Ingredients"
                autoComplete="off"
                aria-invalid={fieldState.invalid} />
              <FieldDescription>Separate ingredients with new lines.</FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              </Field>
            )
            } } />
          </FieldGroup>
          <FieldGroup>
            <Controller
            name="instructions"
            control={form.control}
            render={({field, fieldState}) => {
            return (
            <Field data-invalid={fieldState.invalid}>
              <Textarea 
                id={field.name} 
                name={field.name} 
                required
                defaultValue=""
                placeholder="Instructions"
                autoComplete="off"
                aria-invalid={fieldState.invalid} />
              <FieldDescription>Separate instructions with new lines.</FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              </Field>
            )
            } } />
          </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="submit" className="max-w-xl grow">Submit</Button>
            <Button onClick={() => form.reset()} variant="outline" className="max-w-xl grow">Reset</Button>
          </Field>
        </CardFooter>
      </Card>
    )

}
  


