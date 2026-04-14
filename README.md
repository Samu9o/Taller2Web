# Workshop Answers

## Answers for GUIDE.md (Activity 1)

1. **What happens if you send a POST to /products with price: -5? Why?**  
   It fails with `400 Bad Request`. `price` is validated in the DTO with `@IsPositive()`, and the global `ValidationPipe` rejects invalid input before the controller/service logic runs.

2. **What is the role of ParseIntPipe in @Param('id', ParseIntPipe)?**  
   It converts the route param from string to number and validates that it is a valid integer. If conversion fails, Nest returns `400 Bad Request`.

3. **What would happen without @IsNotEmpty() on name?**  
   Empty string values like `""` could pass if only `@IsString()` is present, because empty string is still a string. `@IsNotEmpty()` enforces a non-empty value.

4. **Why does the service throw NotFoundException instead of returning null?**  
   Throwing `NotFoundException` gives a proper HTTP `404` consistently. Returning `null` pushes responsibility to each caller and can lead to inconsistent error handling.

5. **What is the difference between @Get() and @Get(':id')?**  
   `@Get()` handles collection routes (for example, `GET /products`). `@Get(':id')` handles item routes (for example, `GET /products/1`).

---

## Answers for TASKS.md

1. **Dead route diagnosis**  
   In general, if `findAll()` has no `@Get()`, then `GET /tasks` does not match any route and returns `404 Not Found` (not 500). The fix is to add `@Get()` above `findAll()`.  
   In this current codebase, that is already fixed in `tasks.controller.ts`.

2. **When transform: true is not enough**  
   `transform: true` (global `ValidationPipe`) helps transform payloads into DTO instances and can transform values during validation flow, but `ParseIntPipe` is explicit and route-level: it guarantees conversion/validation for that exact parameter and returns a clear 400 if invalid. They overlap in intent, but `ParseIntPipe` is deterministic at the param boundary.

3. **Silent strip vs hard rejection**  
   With only `whitelist: true` and without `forbidNonWhitelisted: true`, request status would be success (`201 Created` in this POST flow), and unknown fields are stripped. So `password` would not reach the service object.  
   Security risk: clients can think sensitive fields are being accepted/saved when they are silently ignored, hiding contract mismatches and potentially masking malicious input attempts.

4. **Mutation side-effect**  
   Yes. `findAll()` returns the internal array reference, and each element is the same object stored in memory. If a caller mutates a returned object, service state changes too.  
   To prevent this, return copies (for example, `return this.products.map((p) => ({ ...p }));`) and optionally avoid in-place mutation in `update`.

5. **The optional field trap**  
   `{"price": -50}` fails validation (`400`) because `price` is present and must satisfy `@IsPositive()`.  
   `{}` passes validation because `price` is absent, and `@IsOptional()` skips validators for missing/null/undefined properties.  
   So “optional” means the property may be omitted; if present, all its validators must pass.

6. **ID reuse after deletion**  
   With `nextId`, IDs are monotonic. If task `#1` is deleted and a new task is created, it gets a new ID (`4`, then `5`, etc.), not reused `1`. `findOne(1)` only finds whatever currently has ID 1, so no collision from create/delete/create.  
   If using `this.tasks.length + 1`, collisions can happen: create 1,2,3; delete 2 (length=2); create -> new ID becomes 3, duplicating existing 3.

7. **Module forgotten**  
   If `UsersModule` is not imported in `AppModule`, server still starts normally, but `/users` routes are not registered. Calling `POST /users` returns `404 Not Found`.  
   This is mainly a runtime routing configuration issue (not a TypeScript compile-time error).

8. **Missing 201**  
   By default, Nest returns `201 Created` for successful `@Post()` handlers. So missing `@HttpCode(HttpStatus.CREATED)` is usually not functionally wrong if you still want 201.  
   It matters when you need a different code (for example 200/202/204) or want explicitness as API contract documentation.

9. **Service throws, not returns null**  
   If returning null, signatures would look like:

```ts
// service
findOne(id: number): Product | null {
  return this.products.find((p) => p.id === id) ?? null;
}

// controller
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  const product = this.productsService.findOne(id);
  if (!product) throw new NotFoundException(`Product #${id} not found`);
  return product;
}
```

   Throwing in the service is usually better for growing codebases because all callers (`findOne`, `update`, `remove`, etc.) get consistent behavior without repeating null checks everywhere.
