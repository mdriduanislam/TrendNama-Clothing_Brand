"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StoredProduct } from "@/lib/products-data";

const formSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().min(1).max(120),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  imagesJson: z.string().min(2),
});

type FormValues = z.infer<typeof formSchema>;

const parseCommaSeparatedList = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const EditProductForm = ({ product }: { product: StoredProduct }) => {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      category: product.category,
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      imagesJson: JSON.stringify(product.images, null, 2),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitMessage(null);

    const sizes = parseCommaSeparatedList(values.sizes);
    const colors = parseCommaSeparatedList(values.colors);

    if (!sizes.length || !colors.length) {
      setSubmitMessage({
        type: "error",
        text: "Sizes and colors must include at least one value.",
      });
      return;
    }

    let images: Record<string, string>;
    try {
      images = JSON.parse(values.imagesJson) as Record<string, string>;
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Images must be valid JSON object.",
      });
      return;
    }

    if (typeof images !== "object" || images === null) {
      setSubmitMessage({
        type: "error",
        text: "Images must be a JSON object with color keys.",
      });
      return;
    }

    const missingColorImage = colors.some((color) => {
      const value = images[color];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missingColorImage) {
      setSubmitMessage({
        type: "error",
        text: "Each selected color must have a non-empty image URL in images JSON.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          shortDescription: values.shortDescription,
          description: values.description,
          price: values.price,
          category: values.category,
          sizes,
          colors,
          images,
        }),
      });

      if (!response.ok) {
        setSubmitMessage({
          type: "error",
          text: "Could not update product. Please try again.",
        });
        return;
      }

      setSubmitMessage({
        type: "success",
        text: "Product updated successfully.",
      });

      router.push("/products");
      router.refresh();
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Network error while updating product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea {...field} rows={5} />
              </FormControl>
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
                  step="0.01"
                  min="0"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
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
                <Input {...field} />
              </FormControl>
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
                <Input {...field} />
              </FormControl>
              <FormDescription>Comma separated list, e.g. s, m, l</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colors</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Comma separated list, e.g. gray, blue, black
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagesJson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images JSON</FormLabel>
              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>
              <FormDescription>
                JSON map where each color key points to an image path or URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitMessage && (
          <p
            className={
              submitMessage.type === "success" ? "text-green-600" : "text-red-600"
            }
          >
            {submitMessage.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/products")}> 
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProductForm;
