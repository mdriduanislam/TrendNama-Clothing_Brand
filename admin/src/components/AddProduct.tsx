"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useRouter } from "next/navigation";
import { useState } from "react";

const categories = [
  "t-shirts",
  "shoes",
  "accessories",
  "bags",
  "dresses",
  "jackets",
  "gloves",
] as const;

const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required!" }),
  shortDescription: z
    .string()
    .min(1, { message: "Short description is required!" })
    .max(60),
  description: z.string().min(1, { message: "Description is required!" }),
  price: z.number().min(1, { message: "Price is required!" }),
  category: z.enum(categories),
  sizes: z.array(z.enum(sizes)).min(1, { message: "Select at least one size" }),
  colors: z
    .array(z.enum(colors))
    .min(1, { message: "Select at least one color" }),
  defaultImage: z.string().optional(),
});

const AddProduct = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultImageFile, setDefaultImageFile] = useState<File | null>(null);
  const [colorImageFiles, setColorImageFiles] = useState<Record<string, File | null>>({});
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      category: undefined,
      sizes: [],
      colors: [],
      defaultImage: "",
    },
  });

  const selectedColors = form.watch("colors") || [];

  const uploadImageFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/product-image", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !result.url) {
      throw new Error(result.error || "Could not upload image.");
    }

    return result.url;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitMessage(null);

    let resolvedDefaultImage = values.defaultImage?.trim() || "";

    try {
      if (defaultImageFile) {
        resolvedDefaultImage = await uploadImageFile(defaultImageFile);
      }
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Could not upload default image. Please try again.",
      });
      return;
    }

    if (!resolvedDefaultImage) {
      setSubmitMessage({
        type: "error",
        text: "Provide a default image URL or upload a default image file.",
      });
      return;
    }

    const images: Record<string, string> = {};

    for (const color of selectedColors) {
      const fileForColor = colorImageFiles[color];
      const colorImageValue = form.getValues(`image_${color}` as never);

      if (fileForColor) {
        try {
          images[color] = await uploadImageFile(fileForColor);
          continue;
        } catch {
          setSubmitMessage({
            type: "error",
            text: `Could not upload image for ${color}. Please try again.`,
          });
          return;
        }
      }

      if (typeof colorImageValue === "string" && colorImageValue.trim()) {
        images[color] = colorImageValue.trim();
      } else {
        images[color] = resolvedDefaultImage;
      }
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          images,
        }),
      });

      if (!response.ok) {
        setSubmitMessage({
          type: "error",
          text: "Could not create product. Please try again.",
        });
        return;
      }

      form.reset({
        name: "",
        shortDescription: "",
        description: "",
        price: 0,
        category: undefined,
        sizes: [],
        colors: [],
        defaultImage: "",
      });
      setDefaultImageFile(null);
      setColorImageFiles({});
      setSubmitMessage({
        type: "success",
        text: "Product created successfully.",
      });
      router.refresh();
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Network error while creating product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Enter the category of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {sizes.map((size) => (
                            <div className="flex items-center gap-2" key={size}>
                              <Checkbox
                                id={`size-${size}`}
                                checked={field.value?.includes(size)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, size]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((v) => v !== size)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor={`size-${size}`} className="text-xs">
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available sizes for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/products/default.png"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Used for all selected colors unless you set a custom color image below.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Upload Default Image (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setDefaultImageFile(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload from your computer. If uploaded, this file is used as default image.
                  </FormDescription>
                </FormItem>
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 my-2">
                            {colors.map((color) => (
                              <div
                                className="flex items-center gap-2"
                                key={color}
                              >
                                <Checkbox
                                  id={`color-${color}`}
                                  checked={field.value?.includes(color)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, color]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((v) => v !== color)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`color-${color}`}
                                  className="text-xs flex items-center gap-2"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {color}
                                </label>
                              </div>
                            ))}
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="mt-8 space-y-4">
                              <p className="text-sm font-medium">
                                Optional: custom image URL per selected color:
                              </p>
                              {field.value.map((color) => (
                                <div className="grid grid-cols-1 gap-2" key={color}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-sm min-w-15">{color}</span>
                                    <Input
                                      placeholder="Leave empty to use default image"
                                      {...form.register(`image_${color}` as never)}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 pl-6">
                                    <span className="text-xs text-muted-foreground min-w-15">
                                      Upload file
                                    </span>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setColorImageFiles((prev) => ({
                                          ...prev,
                                          [color]: file,
                                        }));
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available colors for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {submitMessage && (
                  <p
                    className={`text-sm ${
                      submitMessage.type === "error"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {submitMessage.text}
                  </p>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
