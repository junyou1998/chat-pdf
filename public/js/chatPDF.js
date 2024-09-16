const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        onMounted(() => {
            fetch("http://localhost:3300/vectorCollection")
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    collections.value = data;
                });
        });

        const collections = ref([]);
        const message = ref("Hello vue!");
        const pickedCollection = ref();
        const answer = ref();
        const query = ref();
        const user = ref();

        const ragQuery = () => {
            answer.value = null;
            user.value = query.value;
            console.log("start query");
            fetch(`http://localhost:3300/query/${pickedCollection.value}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query.value,
                }),
            })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    answer.value = data;
                    console.log("已經完成檢索");
                });
        };
        return {
            message,
            collections,
            pickedCollection,
            ragQuery,
            answer,
            query,
            user,
        };
    },
}).mount("#app");
