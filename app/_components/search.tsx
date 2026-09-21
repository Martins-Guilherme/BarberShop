'use client'

import { SearchIcon } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Field, FieldError, FieldGroup } from './ui/field'

const formSchema = z.object({
  search: z.string().trim().min(1, 'A pesquisa deve conter pelo menos um caractere.'),
})

const Search = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  })

  const router = useRouter()

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`/barbershops?search=${data.search}`)
  }

  return (
    <form
      id="form-search"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex items-center gap-2"
    >
      <FieldGroup>
        <Controller
          name="search"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="form-search"
                arial-invalid={fieldState.invalid}
                placeholder="Faça sua busca..."
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]}></FieldError>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit">
        <SearchIcon />
      </Button>
    </form>
  )
}

export default Search
