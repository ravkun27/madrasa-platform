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

type ContentBlock = {
  subheader: string;
  paragraph: string;
};

type FormData = {
  header?: string;
  paragraph?: string;
  socialLinks?: SocialLink[];
  date?: string;
  content?: ContentBlock[];
};

type PageType = "about" | "contact" | "privacy" | "terms";

const EditPages = () => {
  const [activePage, setActivePage] = useState<PageType>("about");
  const [loading, setLoading] = useState(true);
  const aboutUsId = "67d83512b863fa67647e98bd";

  const { register, control, handleSubmit, reset } = useForm<FormData>();

  const socialLinks = useFieldArray({
    control,
    name: "socialLinks",
  });

  const contentBlocks = useFieldArray({
    control,
    name: "content",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        switch (activePage) {
          case "about":
            endpoint = `/public/siteContent/aboutUs`;
            break;
          case "contact":
            endpoint = "/public/siteContent/socialLinks";
            break;
          case "privacy":
            endpoint = "/public/siteContent/privacyPolicy";
            break;
          case "terms":
            endpoint = "/public/siteContent/termsAndConditions";
            break;
        }

        const response: any = await getFetch(endpoint);
        const data =
          response.data[activePage === "about" ? "aboutUs" : activePage];

        if (data) {
          const formattedData: FormData = {
            header: data.header || "",
            paragraph: data.paragraph || "",
            socialLinks: data.socialLinks || [],
            date: data.date
              ? new Date(data.date).toISOString().split("T")[0]
              : "",
            content: data.content || [],
          };
          reset(formattedData);
        }
      } catch (error) {
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activePage, reset]);

  const getEndpoint = (page: PageType) => {
    switch (page) {
      case "about":
        return `/admin/auth/control/aboutUs?aboutUsId=${aboutUsId}`;
      case "contact":
        return "/admin/auth/control/socialLinks";
      case "privacy":
        return "/admin/auth/control/privacyPolicy";
      case "terms":
        return "/admin/auth/control/termsAndConditions";
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const body = (({ socialLinks, header, paragraph, date, content }) => {
        switch (activePage) {
          case "about":
            return { header, paragraph, socialLinks };
          case "contact":
            return { socialLinks };
          case "privacy":
          case "terms":
            return { date: new Date(date!).toISOString(), header, content };
        }
      })(data);

      await putFetch(getEndpoint(activePage), body);
      toast.success("Content updated successfully!");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const renderFormFields = () => {
    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
      <div className="space-y-6">
        {(activePage === "about" ||
          activePage === "privacy" ||
          activePage === "terms") && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {activePage === "about" ? "Header" : "Title"}
            </label>
            <input
              {...register("header")}
              className="w-full p-2 border rounded-md dark:bg-gray-700"
            />
          </div>
        )}

        {activePage === "about" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              {...register("paragraph")}
              rows={4}
              className="w-full p-2 border rounded-md dark:bg-gray-700"
            />
          </div>
        )}

        {(activePage === "privacy" || activePage === "terms") && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Effective Date
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full p-2 border rounded-md dark:bg-gray-700"
            />
          </div>
        )}

        {activePage === "contact" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Social Links</h3>
              <button
                type="button"
                onClick={() =>
                  socialLinks.append({ name: "website", link: "" })
                }
                className="flex items-center gap-2 text-blue-600"
              >
                <FiPlus /> Add Link
              </button>
            </div>

            {socialLinks.fields.map((field, index) => {
              const Icon = socialIcons[field.name] || FaGlobe;
              return (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1 flex gap-4">
                    <div className="relative flex items-center w-40">
                      <select
                        {...register(`socialLinks.${index}.name`)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 appearance-none"
                      >
                        {Object.keys(socialIcons).map((key) => (
                          <option key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3">
                        <Icon className="text-lg" />
                      </span>
                    </div>
                    <input
                      {...register(`socialLinks.${index}.link`)}
                      placeholder="URL"
                      className="flex-1 p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => socialLinks.remove(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {(activePage === "privacy" || activePage === "terms") && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Content Sections</h3>
              <button
                type="button"
                onClick={() =>
                  contentBlocks.append({ subheader: "", paragraph: "" })
                }
                className="flex items-center gap-2 text-blue-600"
              >
                <FiPlus /> Add Section
              </button>
            </div>

            {contentBlocks.fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Section {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => contentBlocks.remove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <input
                  {...register(`content.${index}.subheader`)}
                  placeholder="Subheader"
                  className="w-full p-2 border rounded-md dark:bg-gray-700"
                />
                <textarea
                  {...register(`content.${index}.paragraph`)}
                  placeholder="Content"
                  rows={3}
                  className="w-full p-2 border rounded-md dark:bg-gray-700"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiSave /> Save Changes
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex flex-wrap gap-2 mb-6">
        {(["about", "contact", "privacy", "terms"] as PageType[]).map(
          (page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activePage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          )
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderFormFields()}
      </form>
    </div>
  );
};

export default EditPages;
