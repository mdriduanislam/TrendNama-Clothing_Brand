import { z } from "zod";

export type ProductType = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  createdAt: string;
};

export type ProductsType = ProductType[];

export type CartItemType = ProductType & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  email: z.email().min(1, "Email is required!"),
  phone: z
    .string()
    .min(7, "Phone number must be between 7 and 10 digits!")
    .max(10, "Phone number must be between 7 and 10 digits!")
    .regex(/^\d+$/, "Phone number must contain only numbers!"),
  address: z.string().min(1, "Address is required!"),
  city: z.string().min(1, "City is required!"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardHolder: z.string().min(1, "Card holder is required!"),
  cardNumber: z
    .string()
    .min(16, "Card Number is required!")
    .max(16, "Card Number is required!"),
  expirationDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "Expiration date must be in MM/YY format!"
    ),
  cvv: z.string().min(3, "CVV is required!").max(3, "CVV is required!"),
});

export type PaymentFormInputs = z.infer<typeof paymentFormSchema>;

export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address!"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long!"),
});

export type LoginFormInputs = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Please enter a valid email address!"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long!"),
    confirmPassword: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters long!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterFormInputs = z.infer<typeof registerFormSchema>;

export type AuthUserType = {
  id: string;
  name: string;
  email: string;
};

export type CartStoreStateType = {
  cart: CartItemsType;
  isLoading: boolean;
};

export type CartStoreActionsType = {
  bootstrap: () => Promise<void>;
  addToCart: (product: CartItemType) => Promise<boolean>;
  removeFromCart: (product: CartItemType) => Promise<void>;
  clearCart: () => Promise<void>;
};

export type AuthStoreStateType = {
  user: AuthUserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthStoreActionsType = {
  bootstrap: () => Promise<void>;
  login: (
    payload: LoginFormInputs
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};
