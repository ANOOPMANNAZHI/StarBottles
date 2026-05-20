<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'role'  => ['sometimes', 'in:executive,trainee'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Role must be executive or trainee.',
        ];
    }
}
