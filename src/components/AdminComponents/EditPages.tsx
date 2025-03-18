import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { getFetch, putFetch } from "../../utils/apiCall";
import toast from "react-hot-toast";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

const socialIcons = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  website: FaGlobe,
};

type SocialLink = {
  name: keyof typeof socialIcons;
  link: string;
};

type FormData = {
  header: string;
  paragraph: string;
  socialLinks: SocialLink[];
};

const EditPages = () => {
  const [loading, setLoading] = useState(true);
  const { register, control, handleSubmit, reset } = useForm<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const aboutUsId = "67d83512b863fa67647e98bd";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getFetch(
          `/public/aboutUs?aboutUsId=${aboutUsId}`
        );
        const data = response.data;
        reset({
          header: data.header,
          paragraph: data.paragraph,
          socialLinks: data.socialLinks,
        });
      } catch (error) {
        console.error("Error fetching about us data:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await putFetch(
        `/admin/auth/control/aboutUs?aboutUsId=${aboutUsId}`,
        data
      );
      toast.success("Content updated successfully!");
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading content...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Edit About Us Page
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Header
          </label>
          <input
            {...register("header", { required: true })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paragraph
          </label>
          <textarea
            {...register("paragraph", { required: true })}
            rows={6}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Social Links
            </h3>
            <button
              type="button"
              onClick={() => append({ name: "website", link: "" })}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
            >
              <FiPlus /> Add Link
            </button>
          </div>

          {fields.map((field, index) => {
            const Icon = socialIcons[field.name] || FaGlobe;
            return (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 flex gap-4">
                  <div className="relative flex items-center w-40">
                    <select
                      {...register(`socialLinks.${index}.name`)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
                    >
                      {Object.keys(socialIcons).map((key) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 text-gray-500 dark:text-gray-400">
                      <Icon className="text-lg" />
                    </span>
                  </div>
                  <input
                    {...register(`socialLinks.${index}.link`, {
                      required: true,
                    })}
                    placeholder="URL"
                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:text-red-800 dark:hover:text-red-400"
                >
                  <FiTrash2 />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiSave /> Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditPages;
