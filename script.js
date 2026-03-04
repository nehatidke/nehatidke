async function analyzeText() {
    let text = document.getElementById("textInput").value;
    let pdfFile = document.getElementById("pdfInput").files[0];

    if (pdfFile) {
        text = await extractPDFText(pdfFile);
    }

    if (!text) {
        alert("Please enter text or upload PDF.");
        return;
    }

    let aiScore = calculateAIScore(text);

    document.getElementById("result").innerHTML =
        "AI Probability: " + aiScore + "%<br>" +
        "Human Probability: " + (100 - aiScore) + "%";
}

function calculateAIScore(text) {
    let sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    let sentenceLengths = sentences.map(s => s.split(" ").length);

    let avgLength = sentenceLengths.reduce((a,b)=>a+b,0) / sentenceLengths.length;

    let variation = Math.max(...sentenceLengths) - Math.min(...sentenceLengths);

    let uniqueWords = new Set(text.split(/\s+/)).size;
    let totalWords = text.split(/\s+/).length;

    let vocabularyRichness = uniqueWords / totalWords;

    let score = 0;

    if (variation < 6) score += 30; // AI often uniform
    if (avgLength > 15) score += 30;
    if (vocabularyRichness < 0.5) score += 20;

    score += Math.floor(Math.random() * 20);

    return Math.min(score, 95);
}

async function extractPDFText(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                let page = await pdf.getPage(i);
                let content = await page.getTextContent();
                content.items.forEach(item => {
                    text += item.str + " ";
                });
            }
            resolve(text);
        };
        reader.readAsArrayBuffer(file);
    });
}
