import { Firebase } from "../../firebase";

import { COLLECTION } from "../../../shared/strings/firebase";
import { store } from "../../../redux/store";
import { fetchNews } from "redux/actions/newsActions";
import moment from "moment";

const category = [
  { label: "Mobilité", value: 1 },
  { label: "Mode de vie", value: 2 },
  { label: "Nouveau produit", value: 3 },
  { label: "Annonce générale", value: 4 }
];
export default class NewsViewModel extends Firebase {

  async getNews(cityId) {
    const news = await this.firestore
      .collection(COLLECTION.news)
      .where("cityId", "==", cityId)
      .orderBy("createdOn", "desc")
      .get();

    return news.docs.map((news) => {
      const newsData = news?.data();


      return {
        title: newsData?.title,
        author: newsData?.author,
        category: newsData?.category,
        id: newsData?.id,
        text: newsData?.text,
        text_eng: newsData?.text_eng ?? "",
        url: newsData?.url,
        imageUrl: newsData?.imageUrl,
        createdOn: newsData?.createdOn,
        isActive: (newsData.status || "active") == "active",

      };
    });
  }

  async getNewsWithId(newsId) {
    const news = await this.firestore
      .collection(COLLECTION.news)
      .doc(newsId)
      .get();
    const newsData = news?.data();

    const categoryItem = category.find(element => newsData?.category === element.label);

    const formatedData = {
      title: newsData?.title || "",
      author: newsData?.author || "",
      category: categoryItem ?? newsData?.category,
      id: newsData?.id,
      text: newsData?.text || "",
      text_eng: newsData?.text_eng ?? "",
      url: newsData?.url || "",
      imageUrl: newsData?.imageUrl || "",
      isActive: (newsData.status || "active") == "active",
      createdOn: newsData?.createdOn
    };

    return formatedData;
  }

  async createNews(values) {

    const author = values.author || "";
    const category = values.category.label;
    const text = values.text || "";;
    const text_eng = values.text_eng || "";
    const url = values.url || "";
    const title = values.title || "";
    const status = values.isActive ? "active" : "disabled";
    const imageUrl = values.imageUrl.imageUrl || "";
    const cityId = values.cityId || "";

    var newDoc = this.firestore
      .collection(COLLECTION.news)
      .doc();
    newDoc.set({
      title: title,
      author: author,
      category: category,
      text: text,
      text_eng: text_eng,
      url: url,
      imageUrl: imageUrl,
      status: status,
      createdOn: new Date(),
      id: newDoc.id,
      cityId: cityId
    });

    await this.fetchNews(cityId);
  }

  async deleteNews(newsId, cityId) {
    console.log(`deleting ${newsId}`);
    await this.firestore
      .collection(COLLECTION.news)
      .doc(newsId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    await this.fetchNews(cityId);
  }

  async updateNews(newsId, values) {
    const author = values.author;
    const category = values.category;
    const text = values.text;
    const text_eng = values.text_eng ?? "";
    const url = values.url;
    const createdOn = values.createdOn;
    const title = values.title;
    const status = values.isActive ? "active" : "disabled";
    const imageUrl = values.imageUrl;
    const cityId = values.cityId;

    this.firestore
      .collection(COLLECTION.news)
      .doc(newsId)
      .update({
        title: title,
        author: author,
        category: category.label,
        text: text,
        text_eng: text_eng,
        url: url,
        imageUrl: imageUrl,
        status: status,
        createdOn: createdOn,
        updatedOn: new Date(),
      });
    await this.fetchNews(cityId);
  }

  async fetchNews(cityId) {
    const news = await this.firestore
      .collection(COLLECTION.news)
      .where("cityId", "==", cityId)
      .get();
    await store.dispatch((dispatch, getState) => fetchNews(dispatch, getState, news));
  }

}
