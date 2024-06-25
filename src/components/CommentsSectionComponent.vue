<template>
    <div class="comments-section">
      <h4 class="comments-title">Komentáře</h4>
      <div v-if="comments.length === 0" class="no-comments">
        Zatím žádné komentáře.
      </div>
      <div v-else ref="commentsContainer" class="comments-list">
        <div
          v-for="comment in comments"
          :key="comment.id"
          :class="[
            'comment',
            { 'current-user': comment.isWrittenByCurrentUser === true },
          ]"
        >
          <div :class="[
            'comment-author',
            { 'current-user': comment.isWrittenByCurrentUser === true },
          ]">
            {{
              comment.isWrittenByCurrentUser === true ? "Vy" : comment.userName
            }}
          </div>
          <div class="comment-bubble">
            <p class="comment-content">{{ comment.commentText }}</p>
            <div class="comment-metadata">
              <span class="comment-date">{{
                formatDate(comment.dateTimeCreated)
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="new-comment">
        <n-input
          v-model:value="newCommentText"
          type="textarea"
          placeholder="Napište nový komentář..."
        />
        <n-button @click="addComment" :disabled="!newCommentText.trim()">
          Přidat komentář
        </n-button>
      </div>
    </div>
  </template>
<script>
import { ref, onMounted, nextTick } from "vue";
import { NInput, NButton } from "naive-ui";
import { CommentsApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  name: "CommentsSection",
  components: {
    NInput,
    NButton,
  },
  props: {
    offerId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const commentsApi = new CommentsApi(getDefaultApiConfig());
    const comments = ref([]);
    const newCommentText = ref("");
    const commentsContainer = ref(null);

    const fetchComments = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await commentsApi.commentsOfferIdGet(props.offerId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          comments.value = response.data;
          await nextTick();
          scrollToBottom();
        } catch (error) {
          console.error("Failed to load comments for offer:", error);
        }
      } else {
        comments.value = [];
      }
    };

    const addComment = async () => {
      const token = localStorage.getItem("authToken");
      if (token && newCommentText.value.trim()) {
        try {
          const newComment = {
            offerId: props.offerId,
            commentText: newCommentText.value.trim(),
          };

          await commentsApi.commentsPost(newComment, {
            headers: { Authorization: `Bearer ${token}` },
          });

          newCommentText.value = "";
          await fetchComments(); // Refresh comments after adding a new one
        } catch (error) {
          console.error("Failed to add new comment:", error);
        }
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };

      const formattedDate = date.toLocaleDateString("cs-CZ", dateOptions);
      const formattedTime = date.toLocaleTimeString("cs-CZ", timeOptions);

      return `${formattedDate} ${formattedTime}`;
    };

    const scrollToBottom = () => {
      if (commentsContainer.value) {
        commentsContainer.value.scrollTop =
          commentsContainer.value.scrollHeight;
      }
    };

    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      newCommentText,
      addComment,
      formatDate,
      commentsContainer,
    };
  },
};
</script>
<style scoped>
.comments-section {
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  height: 500px; /* Increased height for better visibility */
  background-color: #f0f8f0; /* Light green background */
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.comments-title {
  background-color: #4CAF50; /* Green header */
  color: white;
  border-radius: 12px;
  padding: 5px;
  margin: 0;
  font-size: 1.2em;
}

.comments-list {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  background-color: white;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.comment {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: bold;
  margin-bottom: 5px;
  max-width: 80%;
  padding: 5px 10px;
  border-radius: 12px 12px 0 0;
  align-self: flex-start;
  background-color: #4CAF50; /* Green background for author */
  color: white;
}

.comment-author.current-user {
background-color: #808080; /* Darker green for current user */
  align-self: flex-end;
}

.comment-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 0 12px 12px 12px;
  background-color: #E8F5E9; /* Very light green background */
  align-self: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment.current-user .comment-bubble {
  background-color: #C8E6C9; /* Slightly darker green for current user */
  align-self: flex-end;
  border-radius: 12px 0 12px 12px;
}

.comment-content {
  margin: 0;
  word-wrap: break-word;
  color: #333;
}

.comment-metadata {
  display: flex;
  justify-content: flex-end;
  font-size: 0.8em;
  margin-top: 5px;
  color: #666;
}

.new-comment {
  padding: 20px;
  background-color: white;
}

.new-comment .n-input {
  margin-bottom: 10px;
}

.n-button {
  width: 100%;
  background-color: #4CAF50 !important; /* Green button */
  border-color: #4CAF50 !important;
}

.n-button:hover {
  background-color: #45a049 !important; /* Darker green on hover */
  border-color: #45a049 !important;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

/* Customize scrollbar for webkit browsers */
.comments-list::-webkit-scrollbar {
  width: 8px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 4px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #45a049;
}
</style>