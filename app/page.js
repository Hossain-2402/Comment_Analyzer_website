"use client";




import "./Home.css";
import {useEffect, useState} from "react";
import axios from "axios";
import {pipeline} from "@xenova/transformers";
import Youtube from "react-youtube";

export default function Home() {

  const [videoID,setVideoID] = useState("");
  const [comments,setComments] = useState([]);
  const [isLoading, setIsLoading] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [finishedAnalysis, setFinishedAnalysis] = useState(false);
	
  let positive_comments_counter = 0;
  let negative_comments_counter = 0;

  const [greenFlex, setGreenFlex] = useState(0);
  const [redFlex, setRedFlex] = useState(0);



  const loadVideoComments = ()=>{
    if(videoID == ""){
    	alert("Invalid Video ID");
	return;
    }
    setIsLoading("true");
    axios
      .get("https://www.googleapis.com/youtube/v3/commentThreads", {
        params: {
          part: "snippet",
          videoId: videoID,
          maxResults: 500,
          key: "AIzaSyCq9AM3EVGJr-eO5mSU656oc8Vqv4JrzzA",
        },
      })
      .then((res) => {
        const c = res.data.items.map((item) => {
          const snippet = item.snippet.topLevelComment.snippet;
          return snippet.textDisplay;
        });
        console.log(c);
        setComments(c);
	setIsLoading("false");
      })
      .catch((err) => {
        console.log(err);
      });

	
  }

  const processBatch = async (start, end, comments, p) => {
        for (let i = start; i < end; i++) {
                let current_sentiment = await p(comments[i]);

                const { label } = current_sentiment[0];

                if (label === "POSITIVE") {
                        positive_comments_counter++;
                } else if (label === "NEGATIVE") {
                        negative_comments_counter++;
                }
        }
  };



  const analyzeComments = async ()=>{

	setIsAnalysisLoading(true);

	setFinishedAnalysis(false);

  	const p = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );	



        // 1st batch (0–19%)
        await processBatch(0, Math.floor(comments.length * 0.2), comments, p);
	setTimeout(() => {}, 500); // 0.5-second gap

        // 2nd batch (20–39%)
        await processBatch(Math.floor(comments.length * 0.2), Math.floor(comments.length * 0.4), comments, p);
	setTimeout(() => {}, 500); // 0.5-second gap

        // 3rd batch (40–59%)
        await processBatch(Math.floor(comments.length * 0.4), Math.floor(comments.length * 0.6), comments, p);
	setTimeout(() => {}, 500); // 0.5-second gap

        // 4th batch (60–79%)
        await processBatch(Math.floor(comments.length * 0.6), Math.floor(comments.length * 0.8), comments, p);
	setTimeout(() => {}, 500); // 0.5-second gap

        // 5th batch (80–100%)
        await processBatch(Math.floor(comments.length * 0.8), comments.length, comments, p);



	setIsAnalysisLoading(false);

	setFinishedAnalysis(true);
	

	let pos = positive_comments_counter / (positive_comments_counter + negative_comments_counter);
	let neg = 1 - (positive_comments_counter / (positive_comments_counter + negative_comments_counter));
	
	setGreenFlex(pos);
	setRedFlex(neg);
	
	// console.log(positive_comments_counter / (positive_comments_counter + negative_comments_counter)+ " " + redFlex);
 

	// console.log(positive_comments_counter + " & " + negative_comments_counter);
 
		
  }


let opts = {
	height:"100%",
	width:"100%"
};

  return (      
    <div>
    <link href="https://fonts.googleapis.com/css2?family=Anton+SC&display=swap" rel="stylesheet"/>
	<div className="background_gradient_color"></div>
       

	<div className="input_button_area">   
            <input type="text" placeholder="Enter video ID" className="search_field"  onChange={(e)=>{ setVideoID(e.target.value);}}/>
            <button className="search_btn" onSubmit={()=>{ loadVideoComments(); }} onClick={()=>{  loadVideoComments() }}>Fetch</button>
        </div>


	{isLoading === "" ? (
	  <></>
	) : isLoading === "true" ? (
	  <div className="loading_area">
		<div className="loading_box b1"> </div>
		<div className="loading_box b2"> </div>
		<div className="loading_box b3"> </div>
		<div className="loading_box b3"> </div>
	  </div>
	) : (
	  <>
		<div className="youtube_box"> 
			<Youtube opts={opts} videoId={videoID} className="video"/> 
		</div>
		{isAnalysisLoading === true ? (
			<>
			<div className="loading_area ">
				<div className="loading_box b1 analyze_loading"> L </div>
				<div className="loading_box b2 analyze_loading"> O </div>
				<div className="loading_box b3 analyze_loading"> A </div>
				<div className="loading_box b4 analyze_loading"> D </div>
				<div className="loading_box b5 analyze_loading"> I </div>
				<div className="loading_box b6 analyze_loading"> N </div>
				<div className="loading_box b7 analyze_loading"> G </div>
			  </div>
			  <div className="alert_text">
				The Analysis might take a few minutes
			  </div>
			</>
		) : (
			<>
				<div className="analyze_comments_btn" onClick={()=>{ analyzeComments(); }}>Analyze Comments</div>
				{finishedAnalysis === true?(
					<>
					<div className="sentiment_bar">
					    <div className="positive" style={{ background:"hsl(124 100% 60%)", flex:greenFlex }}>P</div>
					    <div className="negative" style={{ background:"hsl(360 100% 53.2%)", flex:redFlex }}>N</div>
					</div>
					<div className="legend">
						<div className="legend-row">
							<div className="legend-square green"></div>
							<div className="legend-text">Positive comments ( {greenFlex.toFixed(3) * 100}% )</div>
						</div>
						<div className="legend-row">
							<div className="legend-square red"></div>
							<div className="legend-text">Negative comments ( {redFlex.toFixed(3) * 100}% )</div>
						</div>
					</div>
					</>
				) : (<></>)}	
			</>

		)}
	  </>
	)}


	<div className="header_area"> 
		<div className="header_text_box">
			<div className="title_text">Your one stop Analyzer</div>
			<div className="left_chat"></div>
			<div className="right_chat"></div>
			<div className="left_chat"></div>
		</div>

		<div className="header_box h1"></div>
		<div className="header_box h2"></div>
		<div className="header_box h3"></div>
		<div className="header_box h4"></div>
	</div>

	



{/*	

	TASK: Make an animation box that comes under the SEARCH BAR. (from beginning)

	TASK: Make NEVIGATION area

	TASK: Make FOOTER area
*/}

    </div>
  );
}





















